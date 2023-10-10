import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import Stripe from 'stripe';

import { PlanSubscriptionGetByUserIdAction } from 'src/modules/plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import { ConfigService } from '../../../configs/config.service';
import {
  MINIMUM_PRICE,
  PAYMENT_MONTHLY_STATUS,
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_DOMESTIC_ANNUAL_PLAN,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  PRICE_PER_PHONE_NUMBER,
  RATE_CENT_USD,
  TYPE_MESSAGE,
  TYPE_PAYMENT,
  USER_THRESHOLD_GROWTH_PLAN,
  USER_THRESHOLD_HIGH_VOLUME_PLAN,
  USER_THRESHOLD_STARTER_PLAN,
} from '../../../domain/const';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../shared/services/sms.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { buildCronSchedule } from '../../../utils/buildCronSchedule';
import { now } from '../../../utils/nowDate';
import { regionPhoneNumber } from '../../../utils/utilsPhoneNumber';
import { FormSubmissionFindByConditionAction } from '../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { MessagesFindByConditionAction } from '../../messages/services/MessagesFindByConditionAction.service';
import { PaymentMonthlyCreateAction } from '../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from '../../payment.monthly/services/PaymentMonthlyFindConditionAction.service';
import { PaymentMonthlyFindPreviousUnpaidAction } from '../../payment.monthly/services/PaymentMonthlyFindPreviousUnpaidAction.service';
import { PaymentSendInvoiceAction } from '../../payment/services/PaymentSendInvoiceAction.service';
import { PLAN_PAYMENT_METHOD } from '../../plan-subscription/plan-subscription.constant';
import { UserFindByStripeCustomerUserIdAction } from '../../user/services/UserFindByStripeCustomerUserIdAction.service';
import { UserDocument } from '../../user/user.schema';
import { IPrice } from '../interfaces/IGetPriceByItems';
import { IChargeFee, ISmsFee } from '../interfaces/message.interface';

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
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
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
      // planPaymentMethod === PLAN_PAYMENT_METHOD.ANNUAL
      //   ? (createAt.getMonth() + 1).toString()
      //   : undefined,
    );
    if (isTestMode) {
      taskSchedule = now(this.configService.secondsTriggerPaymentMonthly);
    }
    context.logger.info(`****** task schedule: ${taskSchedule} ***`);
    this.backgroundJobService.job(
      taskSchedule,
      undefined,
      () =>
        this.handleChargeByCustomer(
          context,
          user,
          price,
          priceCharged,
          planPaymentMethod,
          createAt,
        ),
      scheduleName,
    );
  }

  private async handleChargeByCustomer(
    context: RequestContext,
    user: UserDocument,
    price: IPrice,
    priceCharged: number,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    createAt: Date,
  ): Promise<void> {
    console.log('******Trigger payment monthly***********');
    console.log(
      `Monthly cron task for user: ${user.id} email: ${user.email} stripeCustomerUserId: ${user.stripeCustomerUserId}`,
    );
    const { id: userId, phoneSystem } = user;
    const { price: pricePlan } = price;
    const endDate = new Date();
    // const startDate =
    //   planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
    //     ? moment(endDate).subtract(1, 'month').toDate()
    //     : moment(endDate).subtract(1, 'year').toDate();
    const startDate = moment(endDate).subtract(1, 'month').toDate();
    // CALCUATE FEE PER MESSAGE SEGMENT
    const feeSms = await this.handleMessageFee(
      context,
      user,
      startDate,
      endDate,
      planPaymentMethod,
    );
    const { totalFeeMms, totalFeeSms, annualUserUpdateMessagesFee } = feeSms;

    let totalFeeChargedMessagesUpdate = 0;
    if (planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY) {
      totalFeeChargedMessagesUpdate = await this.totalBillMessageUpdate(
        context,
        userId,
        startDate,
        endDate,
      );
    }
    const { totalFeeSub, totalSubs } = await this.handleSubscriber(
      context,
      userId,
      pricePlan,
      planPaymentMethod,
    );
    const numberPhoneNumber = phoneSystem?.length || 0;
    const phoneNumberFee = numberPhoneNumber * PRICE_PER_PHONE_NUMBER * RATE_CENT_USD;
    // Rate is cent
    const totalFeeUsed =
      totalFeeSms + totalFeeMms + totalFeeSub + totalFeeChargedMessagesUpdate + phoneNumberFee;

    context.logger
      .info(`Monthly cron task  \ntotalFeeMms: ${totalFeeMms},totalFeeSms: ${totalFeeSms},
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
    if (planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY) {
      context.logger.info('Goto monthly plan');
      if (totalFeeUsed > priceCharged) {
        context.logger.info('\nGoto over plan\n');
        await this.chargeFeeLimited(context, user, chargeFeePayload, planPaymentMethod);
        return;
      }
      if (totalFeeUsed <= pricePlan) {
        context.logger.info('Goto less plan');
        await this.chargeFeeUsed(context, user, chargeFeePayload, planPaymentMethod);
      }
    } else {
      context.logger.info('Goto annual plan');
      await this.chargeFeeForAnnualPlan(
        context,
        user,
        chargeFeePayload,
        planPaymentMethod,
        createAt,
        annualUserUpdateMessagesFee,
      );
    }
  }

  private async handleMessageFee(
    context: RequestContext,
    user: UserDocument,
    startDate: Date,
    endDate: Date,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<ISmsFee> {
    const { phoneSystem, id: userId } = user;
    if (!phoneSystem || (phoneSystem as Array<any>).length === 0) {
      return { totalFeeMms: 0, totalFeeSms: 0, totalSms: 0, annualUserUpdateMessagesFee: 0 };
    }
    const phoneNumberOwner = phoneSystem[0];
    const phone = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;

    const messages = await this.messagesFindByConditionAction.execute({
      userId,
      $or: [{ phoneNumberSent: phone }, { phoneNumberReceipted: phone }],
      status: 'success',
      statusPaid: false,
      createdAt: { $gt: startDate, $lte: endDate },
      // phoneNumberSent: phone,
      // phoneNumberReceipted: phone,
    });
    let totalFeeSms = 0;
    let totalFeeMms = 0;
    const pricePerDomesticMessage =
      planPaymentMethod === PLAN_PAYMENT_METHOD.ANNUAL
        ? PRICE_PER_MESSAGE_DOMESTIC_ANNUAL_PLAN
        : PRICE_PER_MESSAGE_DOMESTIC;

    let annualUserUpdateMessagesFee = 0;
    // ADDED SEGMNETS LOGIC HERE...
    for await (const message of messages) {
      console.log('message', message);
      const segments = message.content ? Math.floor(message?.content?.length / 160) + 1 : 1;
      if (message.typeMessage === TYPE_MESSAGE.MMS) {
        totalFeeMms += this.configService.priceMMS * RATE_CENT_USD;
        continue;
      }
      if (message.phoneNumberReceipted.startsWith('+1')) {
        totalFeeSms += segments * pricePerDomesticMessage * RATE_CENT_USD;
        if (message.typeMessage === TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC) {
          annualUserUpdateMessagesFee += segments * pricePerDomesticMessage * RATE_CENT_USD;
        }
      } else {
        const price = await this.handlePricePerMessage(context, message.phoneNumberReceipted);
        totalFeeSms += Number(price) * segments * 2;
        if (message.typeMessage === TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL) {
          annualUserUpdateMessagesFee += Number(price) * segments * 2;
        }
      }
    }

    return { totalFeeSms, totalFeeMms, totalSms: messages.length, annualUserUpdateMessagesFee };
  }

  private async handleBillCharge(
    context: RequestContext,
    amount: number,
    stripeCustomerUserId: string,
  ): Promise<{ numberCard: string; bill: Stripe.Response<Stripe.PaymentIntent> }> {
    console.log('CRON JOB stripeCustomerUserId in handleBillCharge', stripeCustomerUserId);
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

  private async chargeFeeForAnnualPlan(
    context: RequestContext,
    user: UserDocument,
    payload: IChargeFee,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    createAt: Date,
    annualUserUpdateMessagesFee: number,
  ): Promise<void> {
    // Checking if user's annual plan is expired
    const isExpired = await this.isAnnualPlanExpired(createAt);
    const { priceCharged, price, totalFeeUsed } = payload;
    const { productName } = price;
    // await this.chargeFee(context, user, payload, totalFeeCharge, planPaymentMethod);
    const planRenewalFee = Number((priceCharged * 0.8).toFixed(2)) * 12;
    const monthlyThreshold =
      productName === 'Starter'
        ? USER_THRESHOLD_STARTER_PLAN * RATE_CENT_USD
        : productName === 'Growth'
        ? USER_THRESHOLD_GROWTH_PLAN * RATE_CENT_USD
        : USER_THRESHOLD_HIGH_VOLUME_PLAN * RATE_CENT_USD;
    const monthExpense = totalFeeUsed + annualUserUpdateMessagesFee;
    let overLimit = 0;
    if (monthExpense > monthlyThreshold) {
      overLimit = monthExpense - monthlyThreshold;
    }
    console.log('overLimit', overLimit);
    if (isExpired) {
      console.log('The annual plan has expired.');
      // Charge User for next year + last month overlimit
      const totalFeeCharge = planRenewalFee + overLimit;
      console.log('totalFeeCharge', totalFeeCharge);

      await this.chargeFee(
        context,
        user,
        payload,
        totalFeeCharge,
        planPaymentMethod,
        undefined,
        annualUserUpdateMessagesFee,
      );

      // Update the registration date to the current date
      const planSub = await this.planSubscriptionGetByUserIdAction.execute(user.id);
      if (planSub) {
        // planSub.a2pApprovalDate = new Date();
        planSub.registrationDate = new Date();
        await planSub.save();
      }
    } else {
      console.log('The annual plan is still active.');
      // Charge User for last month overlimit
      await this.chargeFee(
        context,
        user,
        payload,
        overLimit,
        planPaymentMethod,
        undefined,
        annualUserUpdateMessagesFee,
      );
    }
  }

  private async isAnnualPlanExpired(registrationDateString: Date): Promise<boolean> {
    const registrationDate = new Date(registrationDateString);
    const currentDate = new Date();
    const expirationDate = new Date(registrationDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    return currentDate >= expirationDate;
  }

  private async chargeFeeUsed(
    context: RequestContext,
    user: UserDocument,
    payload: IChargeFee,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<void> {
    console.log('CRON Job user in chargeFeeUsed', user);
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
    console.log('CRON Job user in chargeFeeLimited', user);
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
    annualUserUpdateMessagesFee?: number,
  ) {
    console.log('CRON JOB user in chargeFee', user);
    const { stripeCustomerUserId, id: userId } = user;
    console.log('CRON JOB stripeCustomerUserId in chargeFee', stripeCustomerUserId);
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
        planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
          ? totalFeeChargedMessagesUpdate
          : annualUserUpdateMessagesFee,
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
    planPaymentMethod: PLAN_PAYMENT_METHOD,
  ): Promise<{ totalFeeSub: number; totalSubs: number }> {
    const subs = await this.formSubmissionFindByConditionAction.execute(context, {
      owner: userId,
    });
    let feeSub = 0;
    switch (pricePlan) {
      case this.configService.priceStarterPlane: {
        feeSub =
          planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
            ? this.configService.pricePerSubStarterPlane
            : this.configService.pricePerSubStarterPlaneAnnual;
        break;
      }
      case this.configService.priceGrowthPlane: {
        feeSub =
          planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
            ? this.configService.pricePerSubGrowthPlane
            : this.configService.pricePerSubGrowthPlaneAnnual;
        break;
      }
      case this.configService.priceHighVolumePlane: {
        feeSub =
          planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
            ? this.configService.pricePerSubHighVolumePlane
            : this.configService.pricePerSubHighVolumePlaneAnnual;
        break;
      }

      default: {
        feeSub =
          planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
            ? this.configService.pricePerSubStarterPlane
            : this.configService.pricePerSubStarterPlaneAnnual;
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
