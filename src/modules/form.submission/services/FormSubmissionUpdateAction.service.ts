/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { TagsGetByIdsAction } from 'src/modules/tags/services/TagsGetByIdsAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { now } from '../../../utils/nowDate';
import { RequestContext } from '../../../utils/RequestContext';
import { AutomationGetByTagIdsAction } from '../../automation/services/AutomationGetByTagIdsAction.service';
import { AutomationBaseTriggeAction } from '../../automation/services/AutomationTriggerAction/AutomationBaseTriggerAction.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { FormSubmissionUpdatePayload } from '../dtos/FormSubmissionUpdatePayload.dto';
import { FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionFindByIdAction } from './FormSubmissionFindByIdAction.service';
import { FormSubmissionUpdateLastContactedAction } from './FormSubmissionUpdateLastContactedAction.service';

@Injectable()
export class FormSubmissionUpdateAction {
  constructor(
    private formSubmissionFindByIdAction: FormSubmissionFindByIdAction,
    private tagsGetByIdsAction: TagsGetByIdsAction,
    private automationGetByTagIdsAction: AutomationGetByTagIdsAction,
    private automationBaseTriggeAction: AutomationBaseTriggeAction,
    private smsService: SmsService,
    private userFindByIdAction: UserFindByIdAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {}

  async execute(
    context: RequestContext,
    formSubId: string,
    payload: FormSubmissionUpdatePayload,
  ): Promise<FormSubmissionDocument> {
    const { tagIds } = payload;
    const user = await this.userFindByIdAction.execute(context, context.user.id);
    const formSubmissionExist = await this.formSubmissionFindByIdAction.execute(context, formSubId);
    const formUpdate = dynamicUpdateModel<FormSubmissionDocument>(
      { ...payload, isSubscribed: true },
      formSubmissionExist,
    );

    let newTags: string[] = [];
    if (tagIds && tagIds.length > 0) {
      newTags = this.getNewTagAdd(formSubmissionExist, tagIds);
      formUpdate.tags = await this.tagsGetByIdsAction.execute(context, tagIds);
    }
    if (tagIds && tagIds.length === 0) {
      formUpdate.tags = [];
    }
    await formUpdate.save();
    // automation
    if (newTags.length > 0) {
      const automations = await this.automationGetByTagIdsAction.execute(user.id, newTags);
      const { phoneSystem } = user;
      if (phoneSystem) {
        const from = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;
        const startTimeTrigger = now(3000);
        automations.forEach((automation) => {
          this.automationBaseTriggeAction.excuteTasks(
            context,
            this.smsService,
            undefined,
            from,
            startTimeTrigger,
            automation,
            formSubmissionExist.phoneNumber,
            this.formSubmissionUpdateLastContactedAction,
          )();
        });
      }
    }

    return formUpdate.populate([
      { path: 'form' },
      { path: 'tags' },
      { path: 'owner', select: ['-password'] },
    ]);
  }

  private getNewTagAdd(formSubmission: FormSubmissionDocument, tagIds: string[]): string[] {
    const newTags: string[] = [];
    tagIds.forEach((tagId) => {
      if (!formSubmission.tags?.some((tag) => tag._id.toString() === tagId)) {
        newTags.push(tagId);
      }
    });
    return newTags;
  }
}
