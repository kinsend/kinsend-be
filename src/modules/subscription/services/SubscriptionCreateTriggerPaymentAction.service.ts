import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import Stripe from 'stripe';

import { ConfigService } from '../../../configs/config.service';
import {
  MINIMUM_PRICE,
  PAYMENT_MONTHLY_STATUS,
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
import { now } from '../../../utils/nowDate';
import { RequestContext } from '../../../utils/RequestContext';
import { regionPhoneNumber } from '../../../utils/utilsPhoneNumber';
import { FormSubmissionFindByConditionAction } from '../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { MessagesFindByConditionAction } from '../../messages/services/MessagesFindByConditionAction.service';
import { PaymentMonthlyCreateAction } from '../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from '../../payment.monthly/services/PaymentMonthlyFindConditionAction.service';
import { UserFindByStripeCustomerUserIdAction } from '../../user/services/UserFindByStripeCustomerUserIdAction.service';
import { IPrice } from '../interfaces/IGetPriceByItems';
import { IChargeFee, ISmsFee } from '../interfaces/message.interface';
import { PaymentMonthlyFindPreviousUnpaidAction } from '../../payment.monthly/services/PaymentMonthlyFindPreviousUnpaidAction.service';
import { buildCronSchedule } from '../../../utils/buildCronSchedule';
import { PaymentSendInvoiceAction } from '../../payment/services/PaymentSendInvoiceAction.service';
import { UserDocument } from '../../user/user.schema';
import { PLAN_PAYMENT_METHOD } from '../../plan-subscription/plan-subscription.constant';

@Injectable()
export class SubscriptionCreateTriggerPaymentAction {
  constructor(
    private smsService: SmsService,
    private configService: ConfigService,
    private readonly stripeService: StripeService,
    private backgroundJobService: BackgroudJobService,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
    private messagesFindByConditionAction: MessagesFindByConditionAction,
    private paymentMonthlyFindConditionAction: PaymentMonthlyFindConditionAction,
    private formSubmissionFindByConditionAction: FormSubmissionFindByConditionAction,
    private readonly userFindByStripeCustomerUserIdAction: UserFindByStripeCustomerUserIdAction,
    private paymentSendInvoiceAction: PaymentSendInvoiceAction,
    private paymentMonthlyFindPreviousUnpaidAction: PaymentMonthlyFindPreviousUnpaidAction,
  ) {}

  async execute(
    context: RequestContext,
    user: UserDocument,
    price: IPrice,
    priceCharged: number,
    createAt: Date,
    scheduleName: string,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    isTestMode: boolean,
  ): Promise<void> {
    // Create test mode for payment
    context.logger.info('****** Build task schedule ***');
    let taskSchedule: any = buildCronSchedule(
      createAt.getMinutes().toString(),
      createAt.getHours().toString(),
      createAt.getDate().toString(),
      planPaymentMethod === PLAN_PAYMENT_METHOD.ANNUAL
        ? (createAt.getMonth() + 1).toString()
        : undefined,
    );
    if (isTestMode) {
      taskSchedule = now(this.configService.secondsTriggerPaymentMonthly);
    }
    context.logger.info(`****** task schedule: ${taskSchedule} ***`);
    this.backgroundJobService.job(
      taskSchedule,
      undefined,
      () => this.handleChargeByCustomer(context, user, price, priceCharged, planPaymentMethod),
      scheduleName,
    );
  }

  private async handleChargeByCustomer(
    context: RequestContext,
    user: UserDocument,
    price: IPrice,
    priceCharged: number,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<void> {
    console.log('******Trigger payment monthly***********');
    const { id: userId, phoneSystem } = user;
    const { price: pricePlan } = price;
    const endDate = new Date();
    const startDate =
      planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
        ? moment(endDate).subtract(1, 'month').toDate()
        : moment(endDate).subtract(1, 'year').toDate();

    const feeSms = await this.handleMessageFee(context, user, startDate, endDate);
    const { totalFeeMms, totalFeeSms } = feeSms;
    const totalFeeChargedMessagesUpdate = await this.totalBillMessageUpdate(
      context,
      userId,
      startDate,
      endDate,
    );
    const { totalFeeSub, totalSubs } = await this.handleSubscriber(context, userId, pricePlan);
    const numberPhoneNumber = phoneSystem?.length || 0;
    const phoneNumberFee = numberPhoneNumber * PRICE_PER_PHONE_NUMBER * RATE_CENT_USD;
    // Rate is cent
    const totalFeeUsed =
      totalFeeSms + totalFeeMms + totalFeeSub + totalFeeChargedMessagesUpdate + phoneNumberFee;

    context.logger.info(`\ntotalFeeMms: ${totalFeeMms},totalFeeSms: ${totalFeeSms},
     chargedMessagesUpdate: ${totalFeeChargedMessagesUpdate}, priceSubs: ${totalFeeSub},totalSubs: ${totalSubs}, totalFeeUsed: ${totalFeeUsed}, totalFeePhoneNumber: ${phoneNumberFee} `);

    const chargeFeePayload: IChargeFee = {
      totalFeeChargedMessagesUpdate,
      numberPhoneNumber,
      totalFeeUsed,
      feeSms,
      priceCharged,
      price,
      startDate,
      endDate,
      totalSubs,
      totalFeeSub,
    };
    if (totalFeeUsed > priceCharged) {
      context.logger.info('\nGoto over plan\n');
      await this.chargeFeeLimited(context, user, chargeFeePayload, planPaymentMethod);
      return;
    }
    if (totalFeeUsed <= pricePlan) {
      context.logger.info('Goto less plan');
      await this.chargeFeeUsed(context, user, chargeFeePayload, planPaymentMethod);
    }
  }

  private async handleMessageFee(
    context: RequestContext,
    user: UserDocument,
    startDate: Date,
    endDate: Date,
  ): Promise<ISmsFee> {
    const { phoneSystem, id: userId } = user;
    if (!phoneSystem || (phoneSystem as Array<any>).length === 0) {
      return { totalFeeMms: 0, totalFeeSms: 0, totalSms: 0 };
    }
    const phoneNumberOwner = phoneSystem[0];
    const phone = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;

    const messages = await this.messagesFindByConditionAction.execute({
      userId,
      phoneNumberSent: phone,
      status: 'success',
      statusPaid: false,
      createdAt: { $gt: startDate, $lte: endDate },
    });
    let totalFeeSms = 0;
    let totalFeeMms = 0;
    for await (const message of messages) {
      if (message.typeMessage === TYPE_MESSAGE.MMS) {
        totalFeeMms += this.configService.priceMMS * RATE_CENT_USD;
        continue;
      }
      if (message.phoneNumberReceipted.startsWith('+1')) {
        totalFeeSms += PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD;
      } else {
        const price = await this.handlePricePerMessage(context, message.phoneNumberReceipted);
        totalFeeSms += Number(price) * 2;
      }
    }

    return { totalFeeSms, totalFeeMms, totalSms: messages.length };
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
    payload: IChargeFee,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<void> {
    const { priceCharged, totalFeeChargedMessagesUpdate } = payload;
    const totalFeeCharge = priceCharged - totalFeeChargedMessagesUpdate;
    await this.chargeFee(context, user, payload, totalFeeCharge, planPaymentMethod);
  }

  private async chargeFeeLimited(
    context: RequestContext,
    user: UserDocument,
    payload: IChargeFee,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<void> {
    const { totalFeeUsed, totalFeeChargedMessagesUpdate, priceCharged } = payload;
    const overLimit = totalFeeUsed - priceCharged - totalFeeChargedMessagesUpdate;
    const totalFeeCharge = priceCharged + overLimit;
    context.logger.info(`overLimit: ${overLimit}, totalFeeCharge: ${totalFeeCharge}`);

    await this.chargeFee(context, user, payload, totalFeeCharge, planPaymentMethod, overLimit);
  }

  private async chargeFee(
    context: RequestContext,
    user: UserDocument,
    payload: IChargeFee,
    totalFeeCharge: number,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    overLimit?: number,
  ) {
    const { stripeCustomerUserId, id: userId } = user;
    const { price, numberPhoneNumber, feeSms, totalSubs, totalFeeChargedMessagesUpdate } = payload;
    const { totalFeeMms, totalFeeSms, totalSms } = feeSms;
    const { price: pricePlan, productName } = price;
    let amountCharge = totalFeeCharge;

    // Get the previous unpaid payment
    const paymentReviousUnpaid = await this.paymentMonthlyFindPreviousUnpaidAction.execute(
      context,
      userId,
    );
    if (paymentReviousUnpaid) {
      paymentReviousUnpaid.statusPaid = true;
      await paymentReviousUnpaid.save();
      amountCharge += paymentReviousUnpaid.totalPrice;
    }
    if (amountCharge > MINIMUM_PRICE) {
      const { numberCard, bill } = await this.handleBillCharge(
        context,
        amountCharge,
        stripeCustomerUserId,
      );
      const { id, status, amount, created } = bill;
      context.logger.info(`Go to charge fee payment ${planPaymentMethod}`);
      await this.paymentMonthlyCreateAction.execute(context, {
        userId,
        chargeId: id,
        customerId: stripeCustomerUserId,
        statusPaid: status === 'succeeded' || false,
        totalPrice: amount,
        totalMessages: totalSms,
        totalSubs,
        datePaid: new Date(),
        typePayment: planPaymentMethod as any,
      });
      // Send mail here
      await this.paymentSendInvoiceAction.execute(
        context,
        user,
        bill,
        numberCard,
        planPaymentMethod as any,
        undefined,
        undefined,
        totalFeeSms,
        totalFeeMms,
        totalFeeChargedMessagesUpdate,
        pricePlan,
        productName,
        numberPhoneNumber,
        overLimit,
      );
      return;
    }
    // If amount less than 500 cent, save payment to payment next month
    context.logger.info('Total fee less than 500 cent, save payment to payment next month');
    await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      customerId: stripeCustomerUserId,
      statusPaid: false,
      status: PAYMENT_MONTHLY_STATUS.PENDING,
      totalPrice: amountCharge,
      totalMessages: totalSms,
      totalSubs,
      typePayment: planPaymentMethod as any,
    });
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
  ): Promise<{ totalFeeSub: number; totalSubs: number }> {
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
      return { totalFeeSub: subs.length * feeSub * RATE_CENT_USD, totalSubs: subs.length };
    }
    return { totalFeeSub: 0, totalSubs: 0 };
  }

  private async handlePricePerMessage(context: RequestContext, phone: string): Promise<number> {
    const region = regionPhoneNumber(phone);
    if (!region) {
      return PRICE_PER_MESSAGE_INTERNATIONAL;
    }
    const price = await this.smsService.getPriceSendMessage(context, region);
    // Convert to cent
    return price * RATE_CENT_USD;
  }
}
