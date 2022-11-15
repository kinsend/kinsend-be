import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentSchedule, PaymentScheduleDocument } from '../payment.schedule.schema';

@Injectable()
export class PaymentScheduleFindAction {
  constructor(
    @InjectModel(PaymentSchedule.name) private paymentScheduleModel: Model<PaymentScheduleDocument>,
  ) {}

  async execute(): Promise<PaymentScheduleDocument[]> {
    return this.paymentScheduleModel.find({});
  }
}
