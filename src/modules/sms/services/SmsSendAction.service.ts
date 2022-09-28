import { BadGatewayException, Injectable } from '@nestjs/common';
import { SmsService } from '../../../shared/services/sms.service';
import { fillMergeFieldsToMessage } from '../../../utils/fillMergeFieldsToMessage';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionFindByIdAction } from '../../form.submission/services/FormSubmissionFindByIdAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { MessageCreateAction } from '../../messages/services/MessageCreateAction.service';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { SmsSentPayload } from '../dtos/SmsSentPayload.dto';

@Injectable()
export class SmsSendAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private formSubmissionFindByIdAction: FormSubmissionFindByIdAction,
    private messageCreateAction: MessageCreateAction,
    private smsService: SmsService,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {}

  async execute(context: RequestContext, payload: SmsSentPayload): Promise<string> {
    const { user, logger } = context;

    const userExist = await this.userFindByIdAction.execute(context, user.id);
    const formSub = await this.formSubmissionFindByIdAction.execute(
      context,
      payload.formSubmissionId,
    );
    if (!userExist.phoneSystem || (userExist.phoneSystem as PhoneNumber[]).length === 0) {
      logger.info('User no phone number for send sms feature!');
      throw new BadGatewayException('Send update test fail!');
    }

    const phoneNumberOwner = userExist.phoneSystem[0];
    const { phoneNumber, firstName, lastName, email } = formSub;
    const messageFilled = fillMergeFieldsToMessage(payload.message, {
      ...payload,
      mobile: phoneNumber ? `+${phoneNumber.code}${phoneNumber.phone}` : undefined,
      fname: firstName,
      lname: lastName,
      name: `${firstName} ${lastName}`,
      email,
    });

    await this.sendUpdate(context, messageFilled, payload.fileUrl, phoneNumberOwner, phoneNumber);

    return 'Send update test successfully!';
  }

  private async sendUpdate(
    context: RequestContext,
    message: string,
    fileUrl: string | undefined,
    from: PhoneNumber,
    to: PhoneNumber,
  ) {
    const fromStr = `+${from.code}${from.phone}`;
    const toStr = ` +${to.code}${to.phone}`;
    await this.smsService.sendMessageHasThrowError(
      context,
      fromStr,
      message,
      fileUrl,
      toStr,
      this.saveSms(context, fromStr, toStr, message, fileUrl),
    );
  }

  private saveSms(
    context: RequestContext,
    from: string,
    to: string,
    message: string,
    fileUrl?: string,
  ) {
    return async (status = 'success', error?: string) => {
      const promiseActions: any[] = [];
      if (!error) {
        promiseActions.push(
          this.formSubmissionUpdateLastContactedAction.execute(context, to, from),
        );
      }

      promiseActions.push(
        this.messageCreateAction.execute(context, {
          content: message,
          dateSent: new Date(),
          isSubscriberMessage: false,
          status,
          phoneNumberSent: from,
          phoneNumberReceipted: to,
          errorMessage: error,
          fileAttached: fileUrl,
        }),
      );
      await Promise.all(promiseActions);
    };
  }
}
