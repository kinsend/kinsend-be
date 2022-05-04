/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { ConfigService } from '../../../configs/config.service';
import { STATUS } from '../../../domain/const';
import { StripeService } from '../../../shared/services/stripe.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdlAction } from '../../user/services/UserFindByIdAction.service';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class PaymentUpdateDefaultMethodByCustomerIdAction {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly userFindByIdlAction: UserFindByIdlAction,

    private configService: ConfigService,
  ) {}

  async execute(
    context: RequestContext,
    paymentMethodId: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const { user } = context;
    const userInfo = await this.userFindByIdlAction.execute(user.id);

    if (!userInfo) {
      throw new NotFoundException('User', 'User not found');
    }

    const customerInfo = await this.stripeService.updateDefaultPaymentMethodByCustomerId(
      context,
      paymentMethodId,
      userInfo.stripeCustomerUserId,
    );

    const paymentMethodInfo = await this.PaymentModel.findOne({
      $or: [{ stripePaymentMethodId: paymentMethodId }],
    });

    if (!paymentMethodInfo) {
      throw new NotFoundException('Payment', 'Payment method not found');
    }

    await paymentMethodInfo.update({
      status: STATUS.DEFAULT,
    });

    return customerInfo;
  }
}
