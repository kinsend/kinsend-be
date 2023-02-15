import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

import { UserDocument } from 'src/modules/user/user.schema';
import { PaymentSendInvoiceAction } from 'src/modules/payment/services/PaymentSendInvoiceAction.service';
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
    if (userUpdate.isEnabledBuyPlan && !isTestMode) {
      throw new BadRequestException('User already subscribe to plan');
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
      throw new NotFoundException('Product not found!');
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
      productName,
      pricePlan,
    });
    context.logger.info(
      `\n******Save schedule into db successfull, scheduleId: ${schedule.id} ***\n`,
    );

    await this.subscriptionCreateTriggerPaymentAction.execute(
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
}
