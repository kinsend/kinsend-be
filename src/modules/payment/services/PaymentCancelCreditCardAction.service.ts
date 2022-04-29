/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class PaymentCancelCreditCardAction {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
  ) {}

  async execute(
    context: RequestContext,
    setupIntentId: string,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const creditCardInfo = await this.stripeService.cancelCreditCard(context, setupIntentId);
    return creditCardInfo;
  }
}
