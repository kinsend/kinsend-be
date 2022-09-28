/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmissionsFindByTadIdsAction } from '../../../form.submission/services/FormSubmissionsFindByTadIdsAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { FormGetSubmissionsByTagIds } from '../../../form/services/FormGetSubmissionsByTagIds';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateFindByIdWithoutReportingAction } from '../UpdateFindByIdWithoutReportingAction.service';
import { UpdateUpdateProgressAction } from '../UpdateUpdateProgressAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateTaggedTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formGetSubmissionsByTagId: FormGetSubmissionsByTagIds,
    private backgroudJobService: BackgroudJobService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private smsService: SmsService,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    private updateUpdateProgressAction: UpdateUpdateProgressAction,
    private updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    private formSubmissionsFindByTadIdsAction: FormSubmissionsFindByTadIdsAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
    tagId: string | string[],
    datetimeTrigger: Date,
  ): Promise<void> {
    const { logger } = context;
    const isArray = Array.isArray(tagId);
    if (!tagId || (isArray && tagId.length === 0)) {
      logger.info('Skip  update tagged trigger. Tag should not null.');
      return;
    }
    const subscribers = await this.formSubmissionsFindByTadIdsAction.execute(
      context,
      isArray ? tagId : [tagId],
    );
    update.recipients = subscribers;
    update.save();
    this.updateReportingCreateAction.execute(context, update, subscribers);
    this.executeTrigger(
      context,
      this.backgroudJobService,
      this.smsService,
      this.linkRediectCreateByMessageAction,
      this.formSubmissionUpdateLastContactedAction,
      this.updateUpdateProgressAction,
      this.updateFindByIdWithoutReportingAction,
      ownerPhoneNumber,
      subscribers,
      update,
      datetimeTrigger,
    );
  }
}
