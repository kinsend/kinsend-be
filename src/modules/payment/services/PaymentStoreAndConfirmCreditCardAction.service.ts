/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFindByIdAction } from 'src/modules/user/services/UserFindByIdAction.service';
import Stripe from 'stripe';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { PaymentStoredCreditCardDto } from '../dtos/PaymentStoredCreditCard.dto';
import { Payment, PaymentDocument } from '../payment.schema';
import { PaymentCreateAction } from './PaymentCreateAction.service';

@Injectable()
export class PaymentStoreAndConfirmCreditCardAction {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly userFindByIdAction: UserFindByIdAction,
    private readonly paymentCreateAction: PaymentCreateAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: PaymentStoredCreditCardDto,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    const { paymentMethodId, type } = payload;

    const creditCardInfo = await this.stripeService.storedCreditCard(
      context,
      paymentMethodId,
      userInfo.stripeCustomerUserId,
      [type],
    );

    const paymentModel = {
      userId: userInfo._id,
      stripePaymentMethodId: paymentMethodId,
      stripeSetupIntentId: creditCardInfo.id,
    };

    await this.paymentCreateAction.execute(paymentModel);
    const creditCardConfirmInfo = await this.stripeService.confirmCreditCard(
      context,
      creditCardInfo.id,
    );
    return creditCardConfirmInfo;
  }
}
