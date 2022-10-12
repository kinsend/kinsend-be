import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { PaymentMonthly, PaymentMonthlyDocument } from '../payment.monthly.schema';

@Injectable()
export class PaymentMonthlyFindConditionAction {
  constructor(
    @InjectModel(PaymentMonthly.name) private paymentMonthlyModel: Model<PaymentMonthlyDocument>,
  ) {}

  async execute(context: RequestContext, filter: any): Promise<PaymentMonthlyDocument[]> {
    const payment = await this.paymentMonthlyModel.find(filter);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }
}
