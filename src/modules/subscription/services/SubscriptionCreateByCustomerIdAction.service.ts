/* eslint-disable unicorn/prefer-module */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import Stripe from 'stripe';

import { UserDocument } from 'src/modules/user/user.schema';
import { ConfigService } from '../../../configs/config.service';
import {
  MINIMUM_PRICE,
  PAYMENT_MONTHLY_STATUS,
  PAYMENT_PROGRESS,
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  PRICE_PER_PHONE_NUMBER,
  RATE_CENT_USD,
  TYPE_MESSAGE,
  TYPE_PAYMENT,
} from '../../../domain/const';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../shared/services/sms.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { buildCronSchedule } from '../../../utils/buildCronSchedule';
import { now } from '../../../utils/nowDate';
import { RequestContext } from '../../../utils/RequestContext';
import { regionPhoneNumber } from '../../../utils/utilsPhoneNumber';
import { FormSubmissionFindByConditionAction } from '../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { MessageDocument } from '../../messages/message.schema';
import { MessagesFindByConditionAction } from '../../messages/services/MessagesFindByConditionAction.service';
import { PaymentMonthlyCreateAction } from '../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from '../../payment.monthly/services/PaymentMonthlyFindConditionAction.service';
import { PaymentScheduleDocument } from '../../payment.schedule/payment.schedule.schema';
import { PaymentScheduleCreateAction } from '../../payment.schedule/services/PaymentScheduleCreateAction.service';
import { UserFindByStripeCustomerUserIdAction } from '../../user/services/UserFindByStripeCustomerUserIdAction.service';
import {
  CreateSubscriptionByCustomerIdDto,
  Item,
} from '../dtos/CreateSubscriptionByCustomerId.dto';
import { PaymentSendInvoiceAction } from 'src/modules/payment/services/PaymentSendInvoiceAction.service';

@Injectable()
export class SubscriptionCreateByCustomerIdAction {
  constructor(
    private smsService: SmsService,
    private configService: ConfigService,
    private readonly stripeService: StripeService,
    private mailSendGridService: MailSendGridService,
    private backgroudJobService: BackgroudJobService,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
    private paymentScheduleCreateAction: PaymentScheduleCreateAction,
    private messagesFindByConditionAction: MessagesFindByConditionAction,
    private paymentMonthlyFindConditionAction: PaymentMonthlyFindConditionAction,
    private formSubmissionFindByConditionAction: FormSubmissionFindByConditionAction,
    private readonly userFindByStripeCustomerUserIdAction: UserFindByStripeCustomerUserIdAction,
    private paymentSendInvoiceAction: PaymentSendInvoiceAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
    isTestMode = false,
  ): Promise<PaymentScheduleDocument> {
    const { items } = payload;
    // NOTE Do not use subscribe
    // const subscriptions = await this.stripeService.createSubscriptionByCustomer(context, payload);

    // Caculate total price manual and go to charge
    const userUpdate = await this.userFindByStripeCustomerUserIdAction.execute(payload.customer);
    if (userUpdate.priceSubscribe && !isTestMode) {
      throw new BadRequestException(`User already subscribe to plan`);
    }
    const { prices, productId } = await this.getPriceForCustomerSubscription(
      context,
      payload.items,
    );
    if (prices.length === 0) {
      throw new NotFoundException(`price: ${items} not found!`);
    }
    const product = await this.stripeService.getProductById(context, productId);
    if (!product) {
      throw new NotFoundException(`Product not found!`);
    }
    // Note pricesResult have rate is cent
    const pricePlan = prices[0];
    const schedule = await this.chargePlanCustomerSubscription(
      context,
      userUpdate,
      payload.customer,
      pricePlan,
      product.name,
      isTestMode,
    );
    context.logger.info('***Create schedule successful!***');
    await userUpdate.updateOne({ isEnabledBuyPlan: true, priceSubscribe: items[0].price });
    return schedule;
  }

  private async createScheduleTriggerCharge(
    context: RequestContext,
    user: UserDocument,
    stripeCustomerUserId: string,
    pricePlan: number,
    datetime: Date,
    scheduleName: string,
    productName: string,
    isTestMode: boolean,
  ): Promise<void> {
    // Create test mode for payment
    context.logger.info(`****** Build scron schedule ***`);

    let sronSchedule: any = buildCronSchedule(
      datetime.getMinutes().toString(),
      datetime.getHours().toString(),
      datetime.getDate().toString(),
    );
    if (isTestMode) {
      sronSchedule = now(this.configService.secondsTriggerPaymentMonthly);
    }
    context.logger.info(`****** sronSchedule: ${sronSchedule} ***`);
    this.backgroudJobService.job(
      sronSchedule,
      undefined,
      () =>
        this.handleChargeByCustomer(context, user, pricePlan, stripeCustomerUserId, productName),
      scheduleName,
    );
  }

  private async getPriceForCustomerSubscription(
    context: RequestContext,
    prices: Item[],
  ): Promise<{ prices: number[]; productId: string }> {
    const listPrice: any[] = [];
    let productId = '';
    for await (const item of prices) {
      const detail = await this.stripeService.getDetailPrice(context, item.price);
      productId = detail.product as string;
      listPrice.push(detail.unit_amount);
    }
    return { prices: listPrice, productId };
  }

  private async chargePlanCustomerSubscription(
    context: RequestContext,
    user: UserDocument,
    stripeCustomerUserId: string,
    price: number,
    productName: string,
    isTestMode: boolean,
  ): Promise<any> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const card = paymentMethod.data[0];
    const numberCard = paymentMethod.data[0]?.card?.last4 || '';

    if (!card) {
      context.logger.error('******Card user not found!***');
      throw new BadRequestException('Card user not found!');
    }
    if (!isTestMode) {
      context.logger.info('******Charge plan fee***');
      const bill = await this.stripeService.chargePaymentUser(
        context,
        price,
        card.id,
        stripeCustomerUserId,
        'Payment for registry plan',
      );
      context.logger.info('******Charge plan fee successfull***');

      if (bill.status === 'succeeded') {
        context.logger.info('*****Send mail charge plan fee***');
        const user = await this.userFindByStripeCustomerUserIdAction.execute(stripeCustomerUserId);
        // Send mail after charge registry plan
        await this.paymentSendInvoiceAction.execute(
          context,
          user,
          bill,
          numberCard,
          'REGISTRY',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          price,
          productName,
        );
      }
      await this.saveBillCharged(context, user.id, bill, stripeCustomerUserId);
    }

    context.logger.info('\n******Goto create schedule payment***\n');
    const schedule = await this.scheduleTriggerCharge(
      context,
      user,
      price,
      productName,
      stripeCustomerUserId,
      isTestMode,
    );
    return schedule;
  }

  private async scheduleTriggerCharge(
    context: RequestContext,
    user: UserDocument,
    pricePlan: number,
    productName: string,
    stripeCustomerUserId: string,
    isTestMode: boolean,
  ): Promise<any> {
    const datetime = new Date();
    const scheduleName = `${stripeCustomerUserId}-${user.id}`;
    const schedule = await this.paymentScheduleCreateAction.execute(context, {
      userId: user.id,
      customerId: stripeCustomerUserId,
      progress: PAYMENT_PROGRESS.SCHEDULED,
      datetime,
      scheduleName,
      createdAt: datetime,
    });
    context.logger.info(
      `\n******Save schedule into db successfull, scheduleId: ${schedule.id} ***\n`,
    );

    await this.createScheduleTriggerCharge(
      context,
      user,
      stripeCustomerUserId,
      pricePlan,
      datetime,
      scheduleName,
      productName,
      isTestMode,
    );
    return schedule;
  }

  private async saveBillCharged(
    context: RequestContext,
    userId: string,
    bill: Stripe.PaymentIntent,
    stripeCustomerUserId: string,
  ): Promise<void> {
    const { id, amount, status } = bill;
    const result = await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      typePayment: TYPE_PAYMENT.PLAN_SUBSCRIPTION,
      datePaid: new Date(),
    });
    context.logger.info({
      message: 'Save payment_monthly',
      paymentMonthlyId: result.id,
    });
  }

  private async handleChargeByCustomer(
    context: RequestContext,
    user: UserDocument,
    pricePlan: number,
    stripeCustomerUserId: string,
    productName: string,
  ): Promise<void> {
    console.log('******Trigger payment monthly***********');
    const userId = user.id;
    const endDate = new Date();
    const startDate = moment(endDate).subtract(1, 'month').toDate();
    const { totalPriceMms, totalPriceSms } = await this.handleMessageFee(
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

    const { priceSubs, totalSubs } = await this.handleSubscriber(context, userId, pricePlan);
    const numberPhoneNumber = user.phoneSystem?.length || 0;
    const phoneNumberFee = numberPhoneNumber * PRICE_PER_PHONE_NUMBER * RATE_CENT_USD;
    // Rate is cent
    const totalFeeUsed =
      totalPriceSms + totalPriceMms + priceSubs + chargedMessagesUpdate + phoneNumberFee;
    context.logger.info(`\ntotalPriceMms: ${totalPriceMms},totalPriceSms: ${totalPriceSms},
     chargedMessagesUpdate: ${chargedMessagesUpdate}, priceSubs: ${priceSubs},totalSubs: ${totalSubs}, totalFeeUsed: ${totalFeeUsed}, totalFeePhoneNumber: ${phoneNumberFee} `);

    if (totalFeeUsed > pricePlan) {
      context.logger.info(`\nGoto over plan\n`);
      await this.chargeFeeLimited(
        context,
        user,
        totalFeeUsed,
        chargedMessagesUpdate,
        totalSubs,
        pricePlan,
        productName,
        totalPriceSms,
        totalPriceMms,
        priceSubs,
        stripeCustomerUserId,
        startDate,
        endDate,
      );
      return;
    }
    if (totalFeeUsed <= pricePlan) {
      context.logger.info(`Goto less plan`);
      await this.chargeFeeUsed(
        context,
        user,
        chargedMessagesUpdate,
        totalSubs,
        pricePlan,
        productName,
        totalPriceSms,
        totalPriceMms,
        priceSubs,
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
  ): Promise<{ totalPriceSms: number; totalPriceMms: number }> {
    const user = await this.userFindByStripeCustomerUserIdAction.execute(stripeCustomerUserId);
    if (!user.phoneSystem) return { totalPriceMms: 0, totalPriceSms: 0 };
    const phoneNumberOwner = user.phoneSystem[0];
    const phone = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;

    const messages = await this.messagesFindByConditionAction.execute({
      userId,
      phoneNumberSent: phone,
      status: 'success',
      statusPaid: false,
      createdAt: { $gt: startDate, $lte: endDate },
    });
    let totalPriceSms = 0;
    let totalPriceMms = 0;
    for await (const message of messages) {
      if (message.typeMessage === TYPE_MESSAGE.MMS) {
        totalPriceMms += this.configService.priceMMS * RATE_CENT_USD;
        continue;
      }
      if (message.phoneNumberReceipted.startsWith('+1')) {
        totalPriceSms += PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD;
      } else {
        const price = await this.handlePricePerMessage(context, message.phoneNumberReceipted);
        totalPriceSms += Number(price) * 2;
      }
    }
    return { totalPriceSms, totalPriceMms };
  }

  private async handleBillCharge(
    context: RequestContext,
    amount: number,
    stripeCustomerUserId: string,
  ): Promise<{ numberCard: string; bill: Stripe.Response<Stripe.PaymentIntent> }> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const cardId = paymentMethod.data[0]?.id || '';
    const numberCard = paymentMethod.data[0]?.card?.last4 || '';

    const bill = await this.stripeService.chargePaymentUser(
      context,
      amount,
      cardId,
      stripeCustomerUserId,
      'Pay monthly fees and usage fees',
    );
    return { numberCard, bill };
  }

  private async chargeFeeUsed(
    context: RequestContext,
    user: UserDocument,
    totalBillMessageUpdate: number,
    totalSubs: number,
    pricePlan: number,
    productName: string,
    totalFeeSms: number,
    totalFeeMms: number,
    totalFeeSubs: number,
    stripeCustomerUserId: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<void> {
    const totalFeeCharge = pricePlan - totalBillMessageUpdate;
    const totalMessages = await this.totalMessages(context, user.id, dateTimeStart, dateTimeEnd);
    await this.chargeFee(
      context,
      user,
      totalFeeCharge,
      totalFeeSms,
      totalFeeMms,
      totalFeeSubs,
      totalBillMessageUpdate,
      stripeCustomerUserId,
      totalMessages.length,
      totalSubs,
      pricePlan,
      productName,
    );
  }

  private async chargeFeeLimited(
    context: RequestContext,
    user: UserDocument,
    totalFeeUsed: number,
    totalBillMessageUpdate: number,
    totalSubs: number,
    pricePlan: number,
    namePlane: string,
    totalFeeSms: number,
    totalFeeMms: number,
    totalFeeSubs: number,
    stripeCustomerUserId: string,
    dateTimeStart: Date,
    dateTimeEnd: Date,
  ): Promise<void> {
    const feeLimit = totalFeeUsed - pricePlan - totalBillMessageUpdate;
    const totalFeeCharge = pricePlan + feeLimit;
    const totalMessages = await this.totalMessages(context, user.id, dateTimeStart, dateTimeEnd);
    context.logger.info(`feeLimit: ${feeLimit}, totalFeeCharge: ${totalFeeCharge}`);

    await this.chargeFee(
      context,
      user,
      totalFeeCharge,
      totalFeeSms,
      totalFeeMms,
      totalFeeSubs,
      totalBillMessageUpdate,
      stripeCustomerUserId,
      totalMessages.length,
      totalSubs,
      pricePlan,
      namePlane,
    );
  }

  private async getPaymentLastMonth(context: RequestContext, userId: string) {
    const endDate = new Date();
    const startDate = moment(endDate).subtract(1, 'month').toDate();
    // reset hours
    startDate.setHours(0, 0, 0);
    const paymentLastMonth = await this.paymentMonthlyFindConditionAction.execute(context, {
      userId,
      statusPaid: false,
      typePayment: TYPE_PAYMENT.PAYMENT_MONTHLY,
      status: PAYMENT_MONTHLY_STATUS.PENDING,
      createdAt: { $gte: startDate, $lt: endDate },
    });
    return paymentLastMonth;
  }

  private async chargeFee(
    context: RequestContext,
    user: UserDocument,
    totalFee: number,
    totalFeeSms: number,
    totalFeeMms: number,
    totalFeeSubs: number,
    totalFeeUpdateCharged: number,
    stripeCustomerUserId: string,
    totalMessages: number,
    totalSubs: number,
    pricePlane: number,
    productName: string,
  ) {
    let amountCharge = totalFee;
    const paymentLastMonth = await this.getPaymentLastMonth(context, user.id);
    if (paymentLastMonth[0]) {
      amountCharge += paymentLastMonth[0].totalPrice;
    }
    if (amountCharge > MINIMUM_PRICE) {
      const { numberCard, bill } = await this.handleBillCharge(
        context,
        amountCharge,
        stripeCustomerUserId,
      );
      const { id, status, amount, created } = bill;
      context.logger.info(`Go to charge fee payment monthly`);
      await this.paymentMonthlyCreateAction.execute(context, {
        userId: user.id,
        chargeId: id,
        customerId: stripeCustomerUserId,
        statusPaid: status === 'succeeded' || false,
        totalPrice: amount,
        totalMessages: totalMessages,
        totalSubs,
        datePaid: new Date(),
        typePayment: TYPE_PAYMENT.PAYMENT_MONTHLY,
      });
      // Send mail here
      await this.paymentSendInvoiceAction.execute(
        context,
        user,
        bill,
        numberCard,
        'MONTHLY',
        undefined,
        undefined,
        totalFeeSms,
        totalFeeMms,
        totalFeeUpdateCharged,
        pricePlane,
        productName,
      );
      return;
    }
    // If amount less than 500 cent, save payment to payment next month
    context.logger.info(`Total fee less than 500 cent, save payment to payment next month`);
    await this.paymentMonthlyCreateAction.execute(context, {
      userId: user.id,
      customerId: stripeCustomerUserId,
      statusPaid: false,
      status: PAYMENT_MONTHLY_STATUS.PENDING,
      totalPrice: amountCharge,
      totalMessages: totalMessages,
      totalSubs,
      typePayment: TYPE_PAYMENT.PAYMENT_MONTHLY,
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
  ): Promise<{ priceSubs: number; totalSubs: number }> {
    const subs = await this.formSubmissionFindByConditionAction.execute(context, {
      owner: userId,
    });
    let feeSub = 0;
    switch (pricePlan) {
      case this.configService.priceStarterPlane: {
        feeSub = this.configService.pricePerSubStarterPlane;
        break;
      }
      case this.configService.priceGrowthPlane: {
        feeSub = this.configService.pricePerSubGrowthPlane;
        break;
      }
      case this.configService.priceHighVolumePlane: {
        feeSub = this.configService.pricePerSubHighVolumePlane;
        break;
      }

      default: {
        feeSub = this.configService.pricePerSubStarterPlane;
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
