/* eslint-disable unicorn/filename-case */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import {
  CAMPAIGN_REGISTRATION,
  RATE_CENT_USD,
  STANDARD_BRAND_REGISTRATION,
  STARTER_BRAND_REGISTRATION,
  TYPE_PAYMENT,
} from 'src/domain/const';
import { PaymentMonthlyCreateAction } from 'src/modules/payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentSendInvoiceAction } from 'src/modules/payment/services/PaymentSendInvoiceAction.service';
import { UserFindByIdAction } from 'src/modules/user/services/UserFindByIdAction.service';
import { StripeService } from 'src/shared/services/stripe.service';
import { RequestContext } from 'src/utils/RequestContext';
import Stripe from 'stripe';

@Injectable()
export class A2pBrandCampaignCharge {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private stripeService: StripeService,
    private paymentSendInvoiceAction: PaymentSendInvoiceAction,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
  ) {}

  async handleCharge(context: RequestContext, planType: string) {
    const { user, logger } = context;

    logger.info('Charge User for Compliance');

    const userModel = await this.userFindByIdAction.execute(context, user.id);

    const brandRegCharge =
      planType === 'starter' ? STARTER_BRAND_REGISTRATION : STANDARD_BRAND_REGISTRATION;

    const totalFee = (brandRegCharge + CAMPAIGN_REGISTRATION) * RATE_CENT_USD;
    // totalFee *= RATE_CENT_USD;

    logger.info(`The Charge for A2P Registration of ${user.email} for ${planType} is ${totalFee}`);

    const { numberCard, bill } = await this.handleChargeStripeCustomer(
      context,
      totalFee,
      userModel.stripeCustomerUserId,
      'Pay the A2P Brand and Campaign registration fee',
    );
    await this.paymentSendInvoiceAction.execute(
      context,
      userModel,
      bill,
      numberCard,
      'UPDATE', // TODO: Change this to A2P BRAND & CAMPAIGN REGISTRATION
    );

    await this.saveBillCharged(context, user.id, bill, userModel.stripeCustomerUserId);
  }

  private async handleChargeStripeCustomer(
    context: RequestContext,
    fee: number,
    stripeCustomerUserId: string,
    description: string,
  ): Promise<{ numberCard: string; bill: Stripe.Response<Stripe.PaymentIntent> }> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const paymentMethodId = paymentMethod.data[0]?.id || '';
    const numberCard = paymentMethod.data[0]?.card?.last4 || '';
    const paymentIntent = await this.stripeService.chargePaymentUser(
      context,
      fee,
      paymentMethodId,
      stripeCustomerUserId,
      description,
    );

    return { numberCard, bill: paymentIntent };
  }

  private async saveBillCharged(
    context: RequestContext,
    userId: string,
    bill: Stripe.PaymentIntent,
    // updateId: string,
    stripeCustomerUserId: string,
    // totalMessages: number,
  ): Promise<void> {
    const { id, amount, created, status } = bill;
    await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      //   updateId,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      //   totalMessages,
      typePayment: TYPE_PAYMENT.A2P_BRAND_CAMPAIGN_REGISTRATION,
      datePaid: new Date(created),
    });
  }
}
