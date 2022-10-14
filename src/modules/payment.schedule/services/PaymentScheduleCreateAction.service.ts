/* eslint-disable new-cap */
/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { PaymentScheduleCreateDto } from '../dtos/PaymentScheduleCreateDto.dto';
import { PaymentSchedule, PaymentScheduleDocument } from '../payment.schedule.schema';

@Injectable()
export class PaymentScheduleCreateAction {
  constructor(
    @InjectModel(PaymentSchedule.name) private paymentScheduleModel: Model<PaymentScheduleDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: PaymentScheduleCreateDto,
  ): Promise<PaymentScheduleDocument> {
    const schedule = await new this.paymentScheduleModel({ ...payload }).save();
    return schedule;
  }
}
