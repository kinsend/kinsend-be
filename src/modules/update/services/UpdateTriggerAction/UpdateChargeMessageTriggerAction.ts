/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable curly */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MessageDocument } from 'src/modules/messages/message.schema';
import { UserDocument } from 'src/modules/user/user.schema';
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
import { MessagesFindByConditionAction } from '../../../messages/services/MessagesFindByConditionAction.service';
import { MessageUpdateManyAction } from '../../../messages/services/MessageUpdateManyAction.service';
import { PaymentMonthlyCreateAction } from '../../../payment.monthly/services/PaymentMonthlyCreateAction.service';
import { MessageContext } from '../../../subscription/interfaces/message.interface';
import { UserFindByIdAction } from '../../../user/services/UserFindByIdAction.service';
import { unitAmountToPrice } from '../../../../utils/convertPrice';

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
  ) {}

  async execute(context: RequestContext, updateId: string, datetimeTrigger: Date): Promise<void> {
    const { logger } = context;
    logger.info('Charge message after trigger.');

    const { user } = context;
    const userModel = await this.userFindByIdAction.execute(context, user.id);
    const [messageDomestic, messageInternational] = await Promise.all([
      this.handleMessages(context, updateId, datetimeTrigger, TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC),
      this.handleMessages(
        context,
        updateId,
        datetimeTrigger,
        TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL,
      ),
    ]);
    console.log('items :>> ', [messageDomestic, messageInternational]);
    const totalFee = messageDomestic.totalPrice + messageInternational.totalPrice;

    const messages = await this.totalMessage(updateId, datetimeTrigger);
    const isValid = await this.verifyPriceCharge(context, totalFee);

    if (isValid) {
      const bill = await this.handleChargeStripeCustomer(
        context,
        totalFee,
        userModel.stripeCustomerUserId,
        'Pay the update fee',
      );
      await this.sendBillToCustomer(
        context,
        userModel,
        bill,
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
  // 2022-09-10T16:43:24.813Z < 2022-10-10T16:42:31.816+00:00 <  2022-10-10T16:43:24.813Z

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
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentMethod = await this.stripeService.listStoredCreditCards(
      context,
      stripeCustomerUserId,
    );
    const paymentMethodId = paymentMethod.data[0]?.id || '';
    const paymentIntent = await this.stripeService.chargePaymentUser(
      context,
      fee * RATE_CENT_USD,
      paymentMethodId,
      stripeCustomerUserId,
      description,
    );

    return paymentIntent;
  }

  private async sendBillToCustomer(
    context: RequestContext,
    user: UserDocument,
    bill: Stripe.PaymentIntent,
    messageDomestic: MessageContext,
    messageInternational: MessageContext,
  ): Promise<void> {
    const { created, amount, currency, customer } = bill;
    const { email, phoneNumber, firstName, lastName } = user;
    const filePath = path.join(
      __dirname,
      '../../../views/templates/payment/payment_message_update.hbs',
    );

    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: `${firstName} ${lastName}`,
      phoneUser: `+${phoneNumber[0].code}${phoneNumber[0].phone}`,
      email,
      customer,
      amount: unitAmountToPrice(amount),
      domestic: messageDomestic,
      international: messageInternational,
      units: 1,
      numberCard: '0183',
      currency: currency.toUpperCase(),
      datetime: moment(created).format('ll'),
      datetimeEdt: momentTimeZone(created).tz('America/Los_Angeles').format(),
    };
    const { mailForm } = this.configService;
    const htmlToSend = template(replacements);
    const mail = {
      to: email,
      subject: 'Invoice by message update | KinSend',
      from: mailForm,
      html: htmlToSend,
    };

    await this.mailSendGridService.sendUserStatusPayment(mail);
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
    for await (const message of messages) {
      if (
        message.phoneNumberReceipted.startsWith('+1') &&
        typeMessage === TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC
      ) {
        totalPrice += PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD;
      } else {
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
