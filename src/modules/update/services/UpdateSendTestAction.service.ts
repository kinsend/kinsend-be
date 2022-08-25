/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable new-cap */
import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmsService } from '../../../shared/services/sms.service';
import { fillMergeFieldsToMessage } from '../../../utils/fillMergeFieldsToMessage';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionFindByIdAction } from '../../form.submission/services/FormSubmissionFindByIdAction.service';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { UpdateSendTestPayload } from '../dtos/UpdateSendTestPayload.dto';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateSendTestAction {
  constructor(
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userFindByIdAction: UserFindByIdAction,
    private smsService: SmsService,
    private formSubmissionFindByIdAction: FormSubmissionFindByIdAction,
  ) {}

  async execute(context: RequestContext, payload: UpdateSendTestPayload): Promise<string> {
    const { user, logger } = context;
    const userExist = await this.userFindByIdAction.execute(context, user.id);
    const contacts = await this.formSubmissionFindByIdAction.execute(context, payload.contactsId);

    if (!userExist.phoneSystem || (userExist.phoneSystem as PhoneNumber[]).length === 0) {
      logger.info('User no phone number for send sms feature!');
      throw new BadGatewayException('Send update test fail!');
    }

    const phoneNumberOwner = userExist.phoneSystem[0];
    const { phoneNumber } = contacts;
    const { phoneNumber: payloadPhoneNumber } = payload;
    const messageFilled = fillMergeFieldsToMessage(payload.message, {
      ...payload,
      mobile: payloadPhoneNumber
        ? `+${payloadPhoneNumber.code}${payloadPhoneNumber.phone}`
        : undefined,
    });
    await this.sendUpdate(context, messageFilled, phoneNumberOwner, phoneNumber);

    return 'Send update test successfully!';
  }

  private async sendUpdate(
    context: RequestContext,
    message: string,
    from: PhoneNumber,
    to: PhoneNumber,
  ) {
    const fromStr = `+${from.code}${from.phone}`;
    const toStr = ` +${to.code}${to.phone}`;
    // Note: pass update lastContacted
    await this.smsService.sendMessageHasThrowError(context, fromStr, message, undefined, toStr);
  }
}
