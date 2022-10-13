import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../../../configs/config.service';
import {
  PRICE_ATTACH_CHARGE,
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  RATE_CENT_USD,
  TYPE_MESSAGE,
  TYPE_PAYMENT,
} from '../../../../domain/const';
import { SmsService } from '../../../../shared/services/sms.service';
import { StripeService } from '../../../../shared/services/stripe.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { regionPhoneNumber } from '../../../../utils/utilsPhoneNumber';
import { MailSendGridService } from '../../../mail/mail-send-grid.service';
import { MessageDocument } from '../../../messages/message.schema';
import { MessagesFindByConditionAction } from '../../../messages/services/MessagesFindByConditionAction.service';
import { MessageUpdateManyAction } from '../../../messages/services/MessageUpdateManyAction.service';
import { PaymentMonthlyCreateAction } from '../../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { PaymentSendInvoiceAction } from '../../../payment/services/PaymentSendInvoiceAction.service';
import { MessageContext } from '../../../subscription/interfaces/message.interface';
import { UserFindByIdAction } from '../../../user/services/UserFindByIdAction.service';

@Injectable()
export class UpdateChargeMessageTriggerAction {
  constructor(
    private smsService: SmsService,
    private stripeService: StripeService,
    private configService: ConfigService,
    private userFindByIdAction: UserFindByIdAction,
    private mailSendGridService: MailSendGridService,
    private messageUpdateManyAction: MessageUpdateManyAction,
    private paymentMonthlyCreateAction: PaymentMonthlyCreateAction,
    private messageFindByConditionAction: MessagesFindByConditionAction,
    private paymentSendInvoiceAction: PaymentSendInvoiceAction,
  ) {}

  async execute(context: RequestContext, updateId: string, datetimeTrigger: Date): Promise<void> {
    const { logger } = context;
    logger.info('Charge message after trigger.');

    const { user } = context;
    const userModel = await this.userFindByIdAction.execute(context, user.id);
    const [messageDomestic, mms] = await Promise.all([
      this.handleMessages(context, updateId, datetimeTrigger, TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC),
      this.handleMessages(context, updateId, datetimeTrigger, TYPE_MESSAGE.MMS),
    ]);
    const messageInternational = await this.handleMessages(
      context,
      updateId,
      datetimeTrigger,
      TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL,
    );
    const totalFee = messageDomestic.totalPrice + messageInternational.totalPrice + mms.totalPrice;
    const messages = await this.totalMessage(updateId, datetimeTrigger);
    logger.info(
      `messageDomestic: ${messageDomestic.totalPrice}, mms: ${mms.totalPrice}, totalFee: ${totalFee}`,
    );

    const isValid = await this.verifyPriceCharge(context, totalFee);

    if (isValid) {
      const { numberCard, bill } = await this.handleChargeStripeCustomer(
        context,
        totalFee,
        userModel.stripeCustomerUserId,
        'Pay the update fee',
      );
      await this.paymentSendInvoiceAction.execute(
        context,
        userModel,
        bill,
        numberCard,
        'UPDATE',
        messageDomestic,
        messageInternational,
      );
      await this.saveBillCharged(
        context,
        user.id,
        bill,
        updateId,
        userModel.stripeCustomerUserId,
        messages.length,
      );
      const ids = messages.map((message) => message._id);
      await this.messageUpdateManyAction.execute(ids, {
        statusPaid: true,
      });
    }
  }

  private async verifyPriceCharge(context: RequestContext, totalFee: number): Promise<boolean> {
    // ex: totalFee <= 5$
    if (totalFee <= PRICE_ATTACH_CHARGE) {
      return false;
    }
    return true;
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
      statusPaid: status === 'succeeded' || false,
      totalPrice: amount,
      totalMessages,
      typePayment: TYPE_PAYMENT.MESSAGE_UPDATE,
      datePaid: new Date(created),
    });
  }

  private async totalMessage(updateId: string, datetimeTrigger: Date): Promise<MessageDocument[]> {
    const messages = await this.messageFindByConditionAction.execute({
      updateId,
      status: 'success',
      dateSent: { $gte: new Date(datetimeTrigger) },
      $and: [
        { typePayment: TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC },
        { typePayment: TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL },
      ],
    });
    return messages;
  }

  private async handleMessages(
    context: RequestContext,
    updateId: string,
    datetimeTrigger: Date,
    typeMessage: TYPE_MESSAGE,
  ): Promise<MessageContext> {
    const messages = await this.messageFindByConditionAction.execute({
      updateId,
      status: 'success',
      dateSent: { $gte: new Date(datetimeTrigger) },
      typeMessage,
    });
    let totalPrice = 0;
    if (
      typeMessage === TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC ||
      typeMessage === TYPE_MESSAGE.MESSAGE_DOMESTIC
    ) {
      totalPrice += messages.length * (PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD);
    } else if (typeMessage === TYPE_MESSAGE.MMS) {
      totalPrice += messages.length * this.configService.priceMMS * RATE_CENT_USD;
    } else {
      // International
      for await (const message of messages) {
        const price = await this.handlePricePerMessage(context, message.phoneNumberReceipted);
        totalPrice += Number(price) * 2;
      }
    }

    return {
      totalMessages: messages.length,
      totalPrice,
    };
  }

  private async handlePricePerMessage(context: RequestContext, phone: string): Promise<number> {
    const region = regionPhoneNumber(phone);
    if (!region) return PRICE_PER_MESSAGE_INTERNATIONAL;
    const price = await this.smsService.getPriceSendMessage(context, region);
    // Convert to cent
    return price * RATE_CENT_USD;
  }
}
