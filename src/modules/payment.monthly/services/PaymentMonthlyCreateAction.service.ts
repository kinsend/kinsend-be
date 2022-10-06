import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { PaymentMonthlyCreateDto } from '../dtos/PaymentMonthlyCreateDto.dto';
import { PaymentMonthly, PaymentMonthlyDocument } from '../payment.monthly.schema';

@Injectable()
export class PaymentMonthlyCreateAction {
  constructor(
    @InjectModel(PaymentMonthly.name) private paymentMonthlyModel: Model<PaymentMonthlyDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: PaymentMonthlyCreateDto,
  ): Promise<PaymentMonthlyDocument> {
    const bill = await new this.paymentMonthlyModel({ ...payload }).save();
    return bill;
  }
}
