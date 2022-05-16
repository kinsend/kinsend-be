/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { PaymentStoredCreditCardDto } from '../dtos/PaymentStoredCreditCard.dto';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class PaymentStoredCreditCardAction {
  constructor(
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly userFindByIdAction: UserFindByIdAction,
  ) {}

  async execute(context: RequestContext, payload: PaymentStoredCreditCardDto): Promise<Payment> {
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    const { paymentMethodId, type } = payload;

    const creditCardInfo = await this.stripeService.storedCreditCard(
      context,
      paymentMethodId,
      userInfo.stripeCustomerUserId,
      [type],
    );

    const paymentModel = new this.PaymentModel({
      userId: userInfo._id,
      stripePaymentMethodId: paymentMethodId,
      stripeSetupIntentId: creditCardInfo.id,
    });

    return paymentModel.save();
  }
}
