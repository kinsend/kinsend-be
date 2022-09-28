import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { UserFindByPhoneSystemAction } from '../../user/services/UserFindByPhoneSystemAction.service';
import { ISmsLogCreatePayload } from '../interfaces/sms.log.interface';
import { SmsLog, SmsLogDocument } from '../sms.log.schema';

@Injectable()
export class SmsLogCreateAction {
  constructor(
    @InjectModel(SmsLog.name) private SmsLogModel: Model<SmsLogDocument>,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
  ) {}

  async execute(payload: ISmsLogCreatePayload): Promise<SmsLogDocument> {
    const { From, To } = payload;
    const [usersFrom, usersTo] = await Promise.all([
      this.userFindByPhoneSystemAction.execute(convertStringToPhoneNumber(From)),
      this.userFindByPhoneSystemAction.execute(convertStringToPhoneNumber(To)),
    ]);
    const userFrom = usersFrom[0];
    const userTo = usersTo[0];
    const response = await new this.SmsLogModel({
      formUserId: userFrom?.id || '',
      toUserId: userTo?.id || '',
      from: From,
      to: To,
      metaData: JSON.stringify(payload),
    }).save();
    return response;
  }
}
