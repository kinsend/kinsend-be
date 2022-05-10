/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { STATUS } from '../../../domain/const';
import { StripeService } from '../../../shared/services/stripe.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class PaymentAttachCreditCardToConsumerAction {
  constructor(
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly userFindByIdAction: UserFindByIdAction,
  ) {}

  async execute(
    context: RequestContext,
    paymentMethodId: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const { logger, correlationId } = context;
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(user.id);

    if (!userInfo) {
      throw new NotFoundException('User', 'User not found');
    }

    await this.stripeService.attachPaymentMethodByCurrentCreditCard(
      context,
      paymentMethodId,
      userInfo.stripeCustomerUserId,
    );
    logger.info({
      correlationId,
      message:"Acttach payment successfull",
    });


    const paymentMethodInfo = await this.PaymentModel.findOne({
      $or: [{ stripePaymentMethodId: paymentMethodId }],
    });

    if (!paymentMethodInfo) {
      throw new NotFoundException('Payment', 'Payment method not found');
    }

    await paymentMethodInfo.update({
      status: STATUS.ATTACHED,
    });
    logger.info({
      correlationId,
      message:"Update ATTACHED status for payment successfull",
    });

    const customerInfo = await this.stripeService.updateDefaultPaymentMethodByCustomerId(
      context,
      paymentMethodId,
      userInfo.stripeCustomerUserId,
    );
    logger.info({
      correlationId,
      message:"Update payment defaul for customer successfull",
    });

    await paymentMethodInfo.update({
      status: STATUS.DEFAULT,
    });
    logger.info({
      correlationId,
      message:"Update DEFAULT status for payment successfull",
    });

    await userInfo.update({ isEnabledPayment: true });

    return customerInfo;
  }
}
