/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormGetSubmissionsByTagIds } from '../../../form/services/FormGetSubmissionsByTagIds';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateTaggedTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formGetSubmissionsByTagId: FormGetSubmissionsByTagIds,
    private backgroudJobService: BackgroudJobService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private smsService: SmsService,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
    tagId: string | string[],
  ): Promise<void> {
    const { logger } = context;
    const isArray = Array.isArray(tagId);
    if (!tagId || (isArray && tagId.length === 0)) {
      logger.info('Skip  update tagged trigger. Tag should not null.');
      return;
    }
    const subscribers = await this.formGetSubmissionsByTagId.execute(
      context,
      isArray ? tagId : [tagId],
    );
    update.recipients = subscribers;
    update.save();
    this.updateReportingCreateAction.execute(context, update, subscribers);
    this.executeTrigger(
      context,
      ownerPhoneNumber,
      subscribers,
      update,
      this.backgroudJobService,
      this.smsService,
      this.linkRediectCreateByMessageAction,
    );
  }
}
