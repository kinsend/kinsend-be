import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { PaymentMonthly, PaymentMonthlyDocument } from '../payment.monthly.schema';

@Injectable()
export class PaymentMonthlyFindPreviousUnpaidAction {
  constructor(
    @InjectModel(PaymentMonthly.name) private paymentMonthlyModel: Model<PaymentMonthlyDocument>,
  ) {}

  async execute(context: RequestContext, userId: string): Promise<PaymentMonthlyDocument> {
    const payment = await this.paymentMonthlyModel
      .find({
        userId,
        statusPaid: false,
      })
      .sort({
        datePaid: -1,
      })
      .limit(1);

    return payment[0];
  }
}
