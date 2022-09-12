/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';
import { FormGetByIdAction } from '../../form/services/FormGetByIdAction.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { UserDocument } from '../../user/user.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { VirtualCardGetByUserIdWithoutAction } from '../../virtualcard/services/VirtualCardGetByUserIdWithoutAction.service';
import { FormSubmissionUpdateAction } from './FormSubmissionUpdateAction.service';
import { FormSubmissionUpdateLastContactedAction } from './FormSubmissionUpdateLastContactedAction.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { MessageCreateAction } from '../../messages/services/MessageCreateAction.service';

@Injectable()
export class FormSubmissionSendVcardAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private userFindByIdAction: UserFindByIdAction,
    private virtualCardGetByUserIdWithoutAction: VirtualCardGetByUserIdWithoutAction,
    private smsService: SmsService,
    private messageCreateAction: MessageCreateAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {}

  async execute(context: RequestContext, id: string): Promise<any> {
    const { user } = context;
    const formSubmissionExist = await this.formSubmissionModel.findById(id);
    if (!formSubmissionExist) {
      throw new NotFoundException('FormSubmission', 'FormSubmission not found!');
    }

    const [owner, vCard] = await Promise.all([
      this.userFindByIdAction.execute(context, user.id),
      this.virtualCardGetByUserIdWithoutAction.execute(context, user.id),
    ]);
    owner.vCard = vCard || undefined;
    await this.sendVcardToSubscriber(context, owner, formSubmissionExist.phoneNumber);

    return 'Sent vcar successful!';
  }

  private async sendVcardToSubscriber(
    context: RequestContext,
    owner: UserDocument,
    subPhoneNumber: PhoneNumber,
  ) {
    const { vCard, phoneSystem } = owner;
    if (!vCard || !vCard.url) {
      return;
    }
    if (!phoneSystem || (phoneSystem as PhoneNumber[]).length === 0) {
      return;
    }

    const { code, phone } = subPhoneNumber;
    const from = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;
    const to = `+${code}${phone}`;
    const vcardUrl = vCard.url || '';
    await this.smsService.sendVitualCardToSubscriber(
      context,
      undefined,
      vcardUrl,
      from,
      to,
      this.saveSms(context, from, to, vcardUrl),
    );
  }

  private saveSms(context: RequestContext, from: string, to: string, fileAttached: string) {
    return async (status = 'success', error?: string) => {
      const promiseActions: any[] = [];
      if (!error) {
        promiseActions.push(this.formSubmissionUpdateLastContactedAction.execute(context, to));
      }

      promiseActions.push(
        this.messageCreateAction.execute(context, {
          fileAttached,
          dateSent: new Date(),
          isSubscriberMessage: false,
          status,
          phoneNumberSent: from,
          phoneNumberReceipted: to,
          errorMessage: error,
        }),
      );
      await Promise.all(promiseActions);
    };
  }
}
