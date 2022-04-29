/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { AppRequest } from '../../../utils/AppRequest';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdlAction } from '../../user/services/UserFindByIdAction.service';
import { PaymentStoredCreditCardDto } from '../dtos/PaymentStoredCreditCard.dto';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class StoredCreditCardAction {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly userFindByIdlAction: UserFindByIdlAction,

    private configService: ConfigService,
  ) {}

  async execute(context: RequestContext, payload: PaymentStoredCreditCardDto): Promise<Payment> {
    const { user } = context;
    try {
      const userInfo = await this.userFindByIdlAction.execute(user.id);
      const { id, type } = payload.paymentMethod;

      const creditCardInfo = await this.stripeService.storedCreditCard(
        context,
        id,
        userInfo.stripeCustomerUserId,
        [type],
      );

      const paymentModel = new this.PaymentModel({
        userId: userInfo._id,
        stripePaymentMethodId: payload.paymentMethod.id,
        metadata: creditCardInfo,
      });
      return await paymentModel.save();
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
  }
}
