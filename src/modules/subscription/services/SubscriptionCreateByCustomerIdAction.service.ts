import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

import { ConfigService } from '../../../configs/config.service';
import { PAYMENT_PROGRESS, TYPE_PAYMENT } from '../../../domain/const';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../shared/services/sms.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionFindByConditionAction } from '../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
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
import { SubscriptionCreateTriggerPaymentAction } from './SubscriptionCreateTriggerPaymentAction.service';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import {
  PLAN_PAYMENT_METHOD,
  PLAN_SUBSCRIPTION_STATUS,
} from '../../plan-subscription/plan-subscription.constant';
import { IPrice } from '../interfaces/IGetPriceByItems';
import { PlanSubscriptionCreateAction } from '../../plan-subscription/services/plan-subscription-create-action.service';
import { PaymentSendInvoiceAction } from '../../payment/services/PaymentSendInvoiceAction.service';
import { UserDocument } from '../../user/user.schema';

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
    private subscriptionCreateTriggerPaymentAction: SubscriptionCreateTriggerPaymentAction,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
    private planSubscriptionCreateAction: PlanSubscriptionCreateAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
    isTestMode = false,
  ): Promise<any> {
    const { items, customer } = payload;
    // NOTE Do not use subscribe
    // const subscriptions = await this.stripeService.createSubscriptionByCustomer(context, payload);

    // Calculate total price manual and go to charge
    const userUpdate = await this.userFindByStripeCustomerUserIdAction.execute(customer);
    const planSubscription = await this.planSubscriptionGetByUserIdAction.execute(userUpdate.id);
    if (userUpdate.isEnabledBuyPlan && !isTestMode) {
      throw new BadRequestException('User already subscribe to plan');
    }
    const price = await this.getPriceByItems(context, items);
    const planPaymentMethod =
      planSubscription && planSubscription.priceId === price.priceId
        ? planSubscription.planPaymentMethod
        : PLAN_PAYMENT_METHOD.MONTHLY;
    // Note pricesResult have rate is cent
    const schedule = await this.chargePlanCustomerSubscription(
      context,
      userUpdate,
      price,
      planPaymentMethod,
      isTestMode,
    );
    context.logger.info('***Create schedule successful!***');
    const { priceId } = price;

    await userUpdate.updateOne({ isEnabledBuyPlan: true, priceSubscribe: priceId });
    if (!planSubscription) {
      await this.planSubscriptionCreateAction.execute(context, {
        priceId: priceId,
        status: PLAN_SUBSCRIPTION_STATUS.ACTIVE,
        planPaymentMethod: PLAN_PAYMENT_METHOD.MONTHLY,
        userId: userUpdate.id,
        registrationDate: new Date(),
      });
    }

    if (planSubscription) {
      planSubscription.status = PLAN_SUBSCRIPTION_STATUS.ACTIVE;
      planSubscription.registrationDate = new Date();
      if (planSubscription.priceId !== priceId) {
        planSubscription.priceId = priceId;
        planSubscription.planPaymentMethod = PLAN_PAYMENT_METHOD.MONTHLY;
      }

      await planSubscription.save();
    }

    return schedule;
  }

  private async getPriceByItems(context: RequestContext, prices: Item[]): Promise<IPrice> {
    const pricesResponse = await Promise.all(
      prices.map((price) => {
        return this.stripeService.getDetailPrice(context, price.price);
      }),
    );
    if (prices.length === 0) {
      throw new NotFoundException(`price: ${prices} not found!`);
    }
    const product = await this.stripeService.getProductById(
      context,
      pricesResponse[0].product as string,
    );
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    return {
      priceId: pricesResponse[0].id,
      price: pricesResponse[0].unit_amount || 0,
      productName: product.name,
    };
  }

  private async chargePlanCustomerSubscription(
    context: RequestContext,
    user: UserDocument,
    price: IPrice,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    isTestMode: boolean,
  ): Promise<any> {
    const { stripeCustomerUserId, id } = user;
    const { id: cardId, last4NumberCard } = await this.stripeService.getCardByCustomerId(
      context,
      stripeCustomerUserId,
    );
    const { price: pricePlan, productName } = price;
    const priceCharge =
      planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
        ? pricePlan
        : Number(((pricePlan - pricePlan * 0.2) * 12).toFixed(1));

    if (!isTestMode) {
      context.logger.info('******Charge plan fee***');

      const bill = await this.stripeService.chargePaymentUser(
        context,
        priceCharge,
        cardId,
        stripeCustomerUserId,
        'Payment for registry plan',
      );
      context.logger.info('******Charge plan fee successful***');
      if (bill.status === 'succeeded') {
        context.logger.info('*****Send mail charge plan fee***');
        // Send mail after charge registry plan
        await this.paymentSendInvoiceAction.execute(
          context,
          user,
          bill,
          last4NumberCard,
          'REGISTRY',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          priceCharge,
          productName,
        );
      }
      await this.saveBillCharged(context, id, bill, stripeCustomerUserId);
    }

    context.logger.info('\n******Goto create schedule payment***\n');
    const schedule = await this.scheduleTriggerCharge(
      context,
      user,
      price,
      priceCharge,
      planPaymentMethod,
      isTestMode,
    );
    return schedule;
  }

  private async scheduleTriggerCharge(
    context: RequestContext,
    user: UserDocument,
    price: IPrice,
    priceCharged: number,
    planPaymentMethod: PLAN_PAYMENT_METHOD,
    isTestMode: boolean,
  ): Promise<any> {
    const { stripeCustomerUserId, id } = user;
    const { price: pricePlan, productName } = price;
    const datetime = new Date();
    const scheduleName = `${stripeCustomerUserId}-${id}`;
    const schedule = await this.paymentScheduleCreateAction.execute(context, {
      userId: id,
      customerId: stripeCustomerUserId,
      progress: PAYMENT_PROGRESS.SCHEDULED,
      type: planPaymentMethod,
      datetime,
      scheduleName,
      createdAt: datetime,
      productName,
      pricePlan,
    });
    context.logger.info(
      `\n******Save schedule into db successful, scheduleId: ${schedule.id} ***\n`,
    );

    await this.subscriptionCreateTriggerPaymentAction.execute(
      context,
      user,
      price,
      priceCharged,
      datetime,
      scheduleName,
      planPaymentMethod,
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
}
