/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { FormGetSubmissionResponse } from '../../../form/interfaces/form.interface';
import { FormGetSubmissionsByTagIds } from '../../../form/services/FormGetSubmissionsByTagIds';
import { UpdateDocument } from '../../update.schema';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateTaggedTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formGetSubmissionsByTagId: FormGetSubmissionsByTagIds,
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
  ): Promise<void> {
    const { logger } = context;
    const { filter } = update;
    const { tagId } = filter;
    const isArray = Array.isArray(tagId);
    if (!tagId || (isArray && tagId.length === 0)) {
      logger.info('Skip  update tagged trigger. Tag should not null.');
      return;
    }
    const forms = await this.formGetSubmissionsByTagId.execute(context, isArray ? tagId : [tagId]);
    const subscribers = this.getSubmissionByForms(forms);
    this.executeTrigger(
      context,
      ownerPhoneNumber,
      subscribers,
      update,
      this.backgroudJobService,
      this.smsService,
    );
  }

  private getSubmissionByForms = (forms: FormGetSubmissionResponse[]): FormSubmission[] => {
    const submissions: FormSubmission[] = [];
    for (const form of forms) {
      for (const sub of form.formsubmissions) {
        const { phoneNumber } = sub;
        if (
          !submissions.some(
            (item) =>
              item.phoneNumber.code === phoneNumber.code &&
              item.phoneNumber.phone === phoneNumber.phone &&
              item.phoneNumber.short === phoneNumber.short,
          )
        ) {
          submissions.push(sub);
        }
      }
    }
    return submissions;
  };
}
