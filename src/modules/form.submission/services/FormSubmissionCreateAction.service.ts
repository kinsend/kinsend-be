/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionCreatePayload } from '../dtos/FormSubmissionCreatePayload.dto';
import { FormGetByIdAction } from '../../form/services/FormGetByIdAction.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { AutomationCreateTriggerAutomationAction } from '../../automation/services/AutomationCreateTriggerAutomationAction.service';
import { UserDocument } from '../../user/user.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { FormDocument } from '../../form/form.schema';
import { VirtualCardGetByUserIdWithoutAction } from '../../virtualcard/services/VirtualCardGetByUserIdWithoutAction.service';
import { FormSubmissionUpdateAction } from './FormSubmissionUpdateAction.service';
import { FormSubmissionUpdateLastContactedAction } from './FormSubmissionUpdateLastContactedAction.service';
import { MessageCreateAction } from '../../messages/services/MessageCreateAction.service';

@Injectable()
export class FormSubmissionCreateAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private formGetByIdAction: FormGetByIdAction,
    private userFindByIdAction: UserFindByIdAction,
    private virtualCardGetByUserIdWithoutAction: VirtualCardGetByUserIdWithoutAction,
    private smsService: SmsService,
    private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction,
    private formSubmissionUpdateAction: FormSubmissionUpdateAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    private messageCreateAction: MessageCreateAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: FormSubmissionCreatePayload,
  ): Promise<FormSubmissionDocument> {
    const { phoneNumber, formId } = payload;
    const formSubmissionExist = await this.formSubmissionModel.findOne({
      'phoneNumber.phone': phoneNumber.phone,
      'phoneNumber.code': phoneNumber.code,
      form: formId,
    });
    if (formSubmissionExist) {
      // Case form submission exist shoud update data
      return this.formSubmissionUpdateAction.execute(context, formSubmissionExist.id, payload);
    }
    const formExist = await this.formGetByIdAction.execute(context, formId);
    const { userId } = formExist;
    const [owner, vCard] = await Promise.all([
      this.userFindByIdAction.execute(context, userId),
      this.virtualCardGetByUserIdWithoutAction.execute(context, userId),
    ]);
    owner.vCard = vCard || undefined;
    const response = new this.formSubmissionModel({
      ...payload,
      form: formExist,
      tags: [formExist.tags],
      owner,
    });
    await response.save();

    if (formExist.isVcardSend || formExist.isEnabled) {
      await this.sendVcardToSubscriber(context, owner, formExist, payload.phoneNumber);
    }
    this.automationCreateTriggerAutomationAction.execute(
      context,
      owner,
      formExist,
      payload.email,
      payload.phoneNumber,
    );

    return response;
  }

  private async sendVcardToSubscriber(
    context: RequestContext,
    owner: UserDocument,
    form: FormDocument,
    subPhoneNumber: PhoneNumber,
  ) {
    const { vCard, phoneSystem } = owner;
    if (!vCard) {
      return;
    }
    if (!phoneSystem || (phoneSystem as PhoneNumber[]).length === 0) {
      return;
    }

    const { code, phone } = subPhoneNumber;
    const from = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;
    const to = `+${code}${phone}`;
    const { isEnabled, isVcardSend, submission } = form;
    const message = isEnabled ? submission || '' : undefined;
    const vcardUrl = isVcardSend ? vCard.url || '' : undefined;
    // Note: run async for update lastContacted
    this.formSubmissionUpdateLastContactedAction.execute(context, to, from);

    await this.smsService.sendVitualCardToSubscriber(
      context,
      message,
      vcardUrl,
      from,
      to,
      this.saveSms(context, from, to, vcardUrl || ''),
    );
  }
  private saveSms(context: RequestContext, from: string, to: string, fileAttached: string) {
    return async (status = 'success', error?: string) => {
      const promiseActions: any[] = [];
      if (!error) {
        promiseActions.push(
          this.formSubmissionUpdateLastContactedAction.execute(context, to, from),
        );
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
