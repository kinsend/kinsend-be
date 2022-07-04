import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmsLog, SmsLogDocument } from '../sms.log.schema';

@Injectable()
export class SmsLogsGetByFromAction {
  constructor(@InjectModel(SmsLog.name) private SmsLogModel: Model<SmsLogDocument>) {}

  async execute(from: string): Promise<SmsLogDocument[]> {
    return this.SmsLogModel.find({
      from,
    });
  }
}
