import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { UpdateSendTestPayload } from '../../update/dtos/UpdateSendTestPayload.dto';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { UserFindByPhoneSystemAction } from '../../user/services/UserFindByPhoneSystemAction.service';

@Injectable()
export class SmsLogCreateAction {
  constructor(
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
    private userFindByIdAction: UserFindByIdAction,
  ) {}

  async execute(payload: UpdateSendTestPayload): Promise<string> {
    // const { user, logger } = context;
    // const userExist = await this.userFindByIdAction.execute(context, user.id);
    // const contacts = await this.formSubmissionFindByIdAction.execute(context, payload.contactsId);

    // if (!userExist.phoneSystem || (userExist.phoneSystem as PhoneNumber[]).length === 0) {
    //   logger.info('User no phone number for send sms feature!');
    //   throw new BadGatewayException('Send sms fail!');
    // }

    // const phoneNumberOwner = userExist.phoneSystem[0];
    // const { phoneNumber } = contacts;
    // const { phoneNumber: payloadPhoneNumber } = payload;
    // const messageFilled = fillMergeFieldsToMessage(payload.message, {
    //   ...payload,
    //   mobile: payloadPhoneNumber
    //     ? `+${payloadPhoneNumber.code}${payloadPhoneNumber.phone}`
    //     : undefined,
    // });
    // await this.sendUpdate(context, messageFilled, phoneNumberOwner, phoneNumber);

    return 'Send update test successfully!';
  }
}
