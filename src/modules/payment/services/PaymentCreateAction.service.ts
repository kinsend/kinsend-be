/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payment.schema';

@Injectable()
export class PaymentCreateAction {
  constructor(
    @InjectModel(Payment.name) private PaymentModel: Model<PaymentDocument>,
  ) {}

  async execute(payload: any): Promise<PaymentDocument> {
    const paymentModel = new this.PaymentModel(payload);
    return await paymentModel.save();
  }
}
