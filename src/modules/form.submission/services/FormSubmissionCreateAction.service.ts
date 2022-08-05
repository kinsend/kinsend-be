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
import { VirtualCardGetByUserIdAction } from '../../virtualcard/services/VirtualCardGetByUserIdAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { AutomationCreateTriggerAutomationAction } from '../../automation/services/AutomationCreateTriggerAutomationAction.service';
import { UserDocument } from '../../user/user.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { FormDocument } from '../../form/form.schema';
import { VirtualCardGetByUserIdWithoutAction } from '../../virtualcard/services/VirtualCardGetByUserIdWithoutAction.service';
import { ConflictException } from '../../../utils/exceptions/ConflictException';

@Injectable()
export class FormSubmissionCreateAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private formGetByIdAction: FormGetByIdAction,
    private userFindByIdAction: UserFindByIdAction,
    private virtualCardGetByUserIdWithoutAction: VirtualCardGetByUserIdWithoutAction,
    private smsService: SmsService,
    private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: FormSubmissionCreatePayload,
  ): Promise<FormSubmissionDocument> {
    const { phoneNumber, email, formId } = payload;
    const formSubmissionExist = await this.formSubmissionModel.findOne({
      'phoneNumber.phone': phoneNumber.phone,
      'phoneNumber.code': phoneNumber.code,
      email,
      form: formId,
    });
    if (formSubmissionExist) {
      throw new ConflictException('You have been subscriber to this form');
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
      owner,
    });
    if (formExist.isVcardSend || formExist.isEnabled) {
      await this.sendVcardToSubscriber(context, owner, formExist, payload.phoneNumber);
    }

    await response.save();
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
    await this.smsService.sendVitualCardToSubscriber(context, message, vcardUrl, from, to);
  }
}
