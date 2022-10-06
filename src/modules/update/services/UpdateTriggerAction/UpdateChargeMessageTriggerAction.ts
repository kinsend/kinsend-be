import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  TYPE_MESSAGE,
  TYPE_PAYMENT,
} from '../../../../domain/const';
import { StripeService } from '../../../../shared/services/stripe.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { MessagesFindByConditionAction } from '../../../messages/services/MessagesFindByConditionAction.service';
import { PaymentMonthlyCreateAction } from '../../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { UserFindByIdAction } from '../../../user/services/UserFindByIdAction.service';

@Injectable()
export class UpdateChargeMessageTriggerAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private stripeService: StripeService,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
    private messageFindByConditionAction: MessagesFindByConditionAction,
  ) {}

  async execute(context: RequestContext, updateId: string, datetimeTrigger: Date): Promise<void> {
    const { logger } = context;
    logger.info('Charge message after trigger.');

    const { user } = context;
    const userModel = await this.userFindByIdAction.execute(context, user.id);
    const items = await Promise.all([
      this.totalFeeMessage(
        updateId,
        datetimeTrigger,
        TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC,
        PRICE_PER_MESSAGE_DOMESTIC,
      ),
      this.totalFeeMessage(
        updateId,
        datetimeTrigger,
        TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL,
        PRICE_PER_MESSAGE_INTERNATIONAL,
      ),
    ]);
    if (items.length > 0) {
      const totalFee = items[0] + items[1];
      if (totalFee === 0) return;
      const bill = await this.handleChargeStripeCustomer(
        context,
        totalFee,
        userModel.stripeCustomerUserId,
      );
      const totalMessages = await this.totalMessage(updateId, datetimeTrigger);
      const billCharged = await this.saveBillCharged(
        context,
        user.id,
        bill,
        updateId,
        userModel.stripeCustomerUserId,
        totalMessages,
      );
    }
  }

  private async handleChargeStripeCustomer(
    context: RequestContext,
    fee: number,
    stripeCustomerUserId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const paymentMethodId = paymentMethod.data[0]?.id || '';
    // const amount = fee * 100;
    const amount = 1001;
    const paymentIntent = await this.stripeService.chargePaymentUser(
      context,
      amount,
      paymentMethodId,
      stripeCustomerUserId,
    );
    return paymentIntent;
  }

  private async saveBillCharged(
    context: RequestContext,
    userId: string,
    bill: Stripe.PaymentIntent,
    updateId: string,
    stripeCustomerUserId: string,
    totalMessages: number,
  ): Promise<void> {
    const { id, amount, created, status } = bill;
    await this.paymentMonthlyCreateAction.execute(context, {
      userId,
      chargeId: id,
      updateId,
      customerId: stripeCustomerUserId,
      statusPaid: status === 'succeeded' ? true : false,
      totalPrice: amount,
      totalMessages,
      typePayment: TYPE_PAYMENT.MESSAGE_UPDATE,
      datePaid: new Date(created),
    });
  }

  private async totalMessage(updateId: string, datetimeTrigger: Date): Promise<number> {
    const messages = await this.messageFindByConditionAction.execute({
      updateId,
      status: 'success',
      dateSent: { $gte: new Date(datetimeTrigger) },
      $and: [
        { typePayment: TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC },
        { typePayment: TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL },
      ],
    });
    return messages.length;
  }

  private async totalFeeMessage(
    updateId: string,
    datetimeTrigger: Date,
    typeMessage: TYPE_MESSAGE,
    pricePerMess: number,
  ): Promise<number> {
    const messages = await this.messageFindByConditionAction.execute({
      updateId,
      status: 'success',
      dateSent: { $gte: new Date(datetimeTrigger) },
      typeMessage,
    });
    if (messages.length > 0) {
      const totalPrice = messages.length * pricePerMess;
      return totalPrice;
    }
    return 0;
  }
}
