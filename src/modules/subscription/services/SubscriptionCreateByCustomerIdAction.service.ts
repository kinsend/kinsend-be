import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import Stripe from 'stripe';

import {
  PAYMENT_PROGRESS,
  PRICE_GROWTH_PLANE,
  PRICE_HIGH_VOLUME_PLANE,
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  PRICE_PER_SUB_GROWTH_PLANE,
  PRICE_PER_SUB_HIGH_VOLUME_PLANE,
  PRICE_PER_SUB_STARTER_PLANE,
  PRICE_STARTER_PLANE,
  RATE_CENT_USD,
  TYPE_MESSAGE,
  TYPE_PAYMENT,
} from '../../../domain/const';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../shared/services/sms.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { buildCronSchedule } from '../../../utils/buildCronSchedule';
import { RequestContext } from '../../../utils/RequestContext';
import { regionPhoneNumber } from '../../../utils/utilsPhoneNumber';
import { FormSubmissionFindByConditionAction } from '../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { MessagesFindByConditionAction } from '../../messages/services/MessagesFindByConditionAction.service';
import { PaymentMonthlyCreateAction } from '../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from '../../payment.monthly/services/PaymentMonthlyFindConditionAction.service';
import { PaymentScheduleCreateAction } from '../../payment.schedule/services/PaymentScheduleCreateAction.service';
import { UserFindByStripeCustomerUserIdAction } from '../../user/services/UserFindByStripeCustomerUserIdAction.service';
import {
  CreateSubscriptionByCustomerIdDto,
  Item,
} from '../dtos/CreateSubscriptionByCustomerId.dto';
import { now } from '../../../utils/nowDate';
import { MessageDocument } from '../../messages/message.schema';
import { ConfigService } from '../../../configs/config.service';
import { PaymentScheduleDocument } from '../../payment.schedule/payment.schedule.schema';

@Injectable()
export class SubscriptionCreateByCustomerIdAction {
  constructor(
    private smsService: SmsService,
    private configService: ConfigService,
    private readonly stripeService: StripeService,
    private backgroudJobService: BackgroudJobService,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
    private paymentScheduleCreateAction: PaymentScheduleCreateAction,
    private messagesFindByConditionAction: MessagesFindByConditionAction,
    private paymentMonthlyFindConditionAction: PaymentMonthlyFindConditionAction,
    private formSubmissionFindByConditionAction: FormSubmissionFindByConditionAction,
    private readonly userFindByStripeCustomerUserIdAction: UserFindByStripeCustomerUserIdAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
  ): Promise<PaymentScheduleDocument> {
    const { items } = payload;
    // NOTE Do not use subscribe
    // const subscriptions = await this.stripeService.createSubscriptionByCustomer(context, payload);

    // Caculate total price manual and go to charge
    const userUpdate = await this.userFindByStripeCustomerUserIdAction.execute(payload.customer);
    const pricesResult = await this.getPriceForCustomerSubscription(context, payload.items);
    if (pricesResult.length === 0) {
      throw new NotFoundException(`price: ${items} not found!`);
    }
    // Note pricesResult have rate is cent
    const pricePlan = pricesResult[0];
    // const [schedule, isCharged] =
    const schedule = await this.chargePlanCustomerSubscription(
      context,
      userUpdate.id,
      payload.customer,
      pricePlan,
    );

    await userUpdate.update({ isEnabledBuyPlan: true });
    return schedule;
  }

  private async createScheduleTriggerCharge(
    context: RequestContext,
    userId: string,
    stripeCustomerUserId: string,
    pricePlan: number,
    datetime: Date,
    scheduleName: string,
  ): Promise<void> {
    // Create test mode for payment
    const sronSchedule = this.configService.isTestModePaymentMonthly
      ? now(this.configService.secondsTriggerPaymentMonthly)
      : buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          datetime.getDate().toString(),
        );
    this.backgroudJobService.job(
      sronSchedule,
      undefined,
      () => this.handleChargeByCustomer(context, userId, pricePlan, stripeCustomerUserId),
      scheduleName,
    );
  }

  private async getPriceForCustomerSubscription(
    context: RequestContext,
    prices: Item[],
  ): Promise<number[]> {
    const listPrice: any[] = [];
    for await (const item of prices) {
      const detail = await this.stripeService.getDetailPrice(context, item.price);
      listPrice.push(detail.unit_amount);
    }
    return listPrice;
  }

  private async chargePlanCustomerSubscription(
    context: RequestContext,
    userId: string,
    stripeCustomerUserId: string,
    price: number,
  ): Promise<any> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const card = paymentMethod.data[0];
    if (!card) {
      throw new BadRequestException('Card user not found!');
    }
    const bill = await this.stripeService.chargePaymentUser(
      context,
      price,
      card.id,
      stripeCustomerUserId,
      'Payment for flat rate',
    );

    await this.saveBillCharged(context, userId, bill, stripeCustomerUserId);

    const schedule = await this.scheduleTriggerCharge(context, userId, price, stripeCustomerUserId);
    await this.scheduleTriggerCharge(context, userId, price, stripeCustomerUserId);
    return schedule;
  }

  private async scheduleTriggerCharge(
    context: RequestContext,
    userId: string,
    pricePlan: number,
    stripeCustomerUserId: string,
  ): Promise<any> {
    const datetime = new Date();
    const scheduleName = `${stripeCustomerUserId}-${userId}`;
    const schedule = await this.paymentScheduleCreateAction.execute(context, {
      userId,
      customerId: stripeCustomerUserId,
      progress: PAYMENT_PROGRESS.SCHEDULED,
      datetime,
      scheduleName,
      createdAt: datetime,
    });
    await this.createScheduleTriggerCharge(
      context,
      userId,
      stripeCustomerUserId,
      pricePlan,
      datetime,
      scheduleName,
    );
    return schedule;
  }

  private async saveBillCharged(
    context: RequestContext,
    userId: string,
    bill: Stripe.PaymentIntent,
    stripeCustomerUserId: string,
  ): Promise<void> {
    const { id, amount, created, status } = bill;
    const result = await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      typePayment: TYPE_PAYMENT.MESSAGE_UPDATE,
      datePaid: new Date(created),
    });
    context.logger.info({
      message: 'Save payment_monthly',
      paymentMonthlyId: result.id,
    });
  }

  private async handleChargeByCustomer(
    context: RequestContext,
    userId: string,
    pricePlan: number,
    stripeCustomerUserId: string,
  ): Promise<void> {
    console.log('******Trigger payment monthly***********');
    const endDate = new Date();
    const startDate = moment(endDate).subtract(1, 'month').toDate();
    const totalMessageFee = await this.handleMessageFee(
      context,
      userId,
      stripeCustomerUserId,
      startDate,
      endDate,
    );
    const chargedMessagesUpdate = await this.totalBillMessageUpdate(
      context,
      userId,
      startDate,
      endDate,
    );
    const { priceSubs, totalSubs } = await this.handleSubscriber(
      context,
      userId,
      pricePlan,
      startDate,
      endDate,
    );

    // Rate is cent
    const totalFeeUsed = totalMessageFee + priceSubs + chargedMessagesUpdate;
    if (totalFeeUsed > pricePlan) {
      await this.chargeFeeLimited(
        context,
        userId,
        totalFeeUsed,
        chargedMessagesUpdate,
        totalSubs,
        pricePlan,
        stripeCustomerUserId,
        startDate,
        endDate,
      );
      return;
    }
    if (totalFeeUsed <= pricePlan) {
      await this.chargeFeeUsed(
        context,
        userId,
        chargedMessagesUpdate,
        priceSubs,
        pricePlan,
        stripeCustomerUserId,
        startDate,
        endDate,
      );
      return;
    }
  }

  private async handleMessageFee(
    context: RequestContext,
    userId: string,
    stripeCustomerUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const user = await this.userFindByStripeCustomerUserIdAction.execute(stripeCustomerUserId);
    if (!user.phoneSystem) return 0;
    const phoneNumberOwner = user.phoneSystem[0];
    const phone = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;

    const messages = await this.messagesFindByConditionAction.execute({
      userId,
      phoneNumberSent: phone,
      status: 'success',
      statusPaid: false,
      createdAt: { $gt: startDate, $lte: endDate },
    });
    let totalPrice = 0;
    for await (const message of messages) {
      if (message.phoneNumberReceipted.startsWith('+1')) {
        totalPrice += PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD;
      } else {
        const price = await this.handlePricePerMessage(context, message.phoneNumberReceipted);
        totalPrice += Number(price) * 2;
      }
    }
    return totalPrice;
  }

  private async handleBillCharge(
    context: RequestContext,
    pricePlan: number,
    stripeCustomerUserId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const cardId = paymentMethod.data[0]?.id || '';
    const bill = await this.stripeService.chargePaymentUser(
      context,
      pricePlan,
      cardId,
      stripeCustomerUserId,
      'Charge monthly fee',
    );
    return bill;
  }

  private async chargeFeeUsed(
    context: RequestContext,
    userId: string,
    totalBillMessageUpdate: number,
    totalSubs: number,
    pricePlan: number,
    stripeCustomerUserId: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<void> {
    const totalFeeCharge = pricePlan - totalBillMessageUpdate;
    const { id, status, amount, created } = await this.handleBillCharge(
      context,
      totalFeeCharge,
      stripeCustomerUserId,
    );
    const totalMessages = await this.totalMessages(context, userId, dateTimeStart, dateTimeEnd);
    await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      totalMessages: totalMessages.length,
      totalSubs,
      datePaid: new Date(created),
      typePayment: TYPE_PAYMENT.MESSAGE,
    });
  }

  private async chargeFeeLimited(
    context: RequestContext,
    userId: string,
    totalFeeUsed: number,
    totalBillMessageUpdate: number,
    totalSubs: number,
    pricePlan: number,
    stripeCustomerUserId: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<void> {
    const feeLimit = totalFeeUsed - pricePlan - totalBillMessageUpdate;
    const totalFeeCharge = pricePlan + feeLimit;

    const { id, status, amount, created } = await this.handleBillCharge(
      context,
      totalFeeCharge,
      stripeCustomerUserId,
    );
    const totalMessages = await this.totalMessages(context, userId, dateTimeStart, dateTimeEnd);
    await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      totalMessages: totalMessages.length,
      totalSubs,
      datePaid: new Date(created),
      typePayment: TYPE_PAYMENT.MESSAGE,
    });
  }

  private async totalMessages(
    context: RequestContext,
    user: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<MessageDocument[]> {
    const messages = await this.messagesFindByConditionAction.execute({
      user,
      status: 'success',
      statusPaid: false,
      createdAt: { $gte: new Date(dateTimeStart), $lt: new Date(dateTimeEnd) },
    });
    return messages;
  }

  private async totalBillMessageUpdate(
    context: RequestContext,
    userId: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<number> {
    const bills = await this.paymentMonthlyFindConditionAction.execute(context, {
      userId,
      statusPaid: true,
      typePayment: TYPE_PAYMENT.MESSAGE_UPDATE,
      createdAt: { $gte: new Date(dateTimeStart), $lt: new Date(dateTimeEnd) },
    });
    const totalPrice = bills.reduce((priv, current) => priv + current.totalPrice, 0);
    return totalPrice;
  }

  private async handleSubscriber(
    context: RequestContext,
    userId: string,
    pricePlan: number,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<{ priceSubs: number; totalSubs: number }> {
    const subs = await this.formSubmissionFindByConditionAction.execute(context, {
      owner: userId,
      createdAt: { $gt: dateTimeStart, $lte: dateTimeEnd },
    });
    let feeSub = 0;
    switch (pricePlan) {
      case PRICE_STARTER_PLANE: {
        feeSub = PRICE_PER_SUB_STARTER_PLANE;
        break;
      }
      case PRICE_GROWTH_PLANE: {
        feeSub = PRICE_PER_SUB_GROWTH_PLANE;
        break;
      }
      case PRICE_HIGH_VOLUME_PLANE: {
        feeSub = PRICE_PER_SUB_HIGH_VOLUME_PLANE;
        break;
      }

      default: {
        feeSub = PRICE_PER_SUB_STARTER_PLANE;
        break;
      }
    }
    if (subs.length > 0) {
      return { priceSubs: subs.length * feeSub * RATE_CENT_USD, totalSubs: subs.length };
    }
    return { priceSubs: 0, totalSubs: 0 };
  }

  private async handlePricePerMessage(context: RequestContext, phone: string): Promise<number> {
    const region = regionPhoneNumber(phone);
    if (!region) return PRICE_PER_MESSAGE_INTERNATIONAL;
    const price = await this.smsService.getPriceSendMessage(context, region);
    // Convert to cent
    return price * RATE_CENT_USD;
  }
}
