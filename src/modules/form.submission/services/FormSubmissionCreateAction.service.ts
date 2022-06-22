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

@Injectable()
export class FormSubmissionCreateAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private formGetByIdAction: FormGetByIdAction,
    private userFindByIdAction: UserFindByIdAction,
    private virtualCardGetByUserIdAction: VirtualCardGetByUserIdAction,
    private smsService: SmsService,
  ) {}

  async execute(
    context: RequestContext,
    payload: FormSubmissionCreatePayload,
  ): Promise<FormSubmissionDocument> {
    const formExist = await this.formGetByIdAction.execute(context, payload.formId);
    const { userId } = formExist;
    const [owner, vCard] = await Promise.all([
      this.userFindByIdAction.execute(context, userId),
      this.virtualCardGetByUserIdAction.execute(context, userId),
    ]);
    owner.vCard = vCard;
    const response = new this.formSubmissionModel({
      ...payload,
      form: formExist,
      owner,
    });
    if (formExist.isVcardSend) {
      // TODO send vcard to subscriber
      console.log('owner :>> ', owner);
      const { code, phone } = payload.phoneNumber;
      const { code: codeFrom, phone: phoneFrom } = owner.phoneNumber[0];
      const to = `${code}${phone}`;
      // const from = `+${codeFrom}${phoneFrom}`;
      const from = '*16502649680';
      await this.smsService.sendVitualCardToSubscriber(context, vCard.url || '', from, to);
    }
    // await response.save();

    return response;
  }
}
