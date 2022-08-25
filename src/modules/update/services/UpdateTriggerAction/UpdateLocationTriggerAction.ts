/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmissionsGetByLocationsAction } from '../../../form.submission/services/FormSubmissionsGetByLocationsAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateLocationTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formSubmissionsGetByLocationsAction: FormSubmissionsGetByLocationsAction,
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
    location: string,
  ): Promise<void> {
    const { logger } = context;
    if (!location) {
      logger.info('Skip  update location trigger. Location should not null.');
      return;
    }
    const subscribers = await this.formSubmissionsGetByLocationsAction.execute(context, location);
    this.updateReportingCreateAction.execute(context, update, subscribers);
    update.recipients = subscribers;
    update.save();
    this.executeTrigger(
      context,
      ownerPhoneNumber,
      subscribers,
      update,
      this.backgroudJobService,
      this.smsService,
      this.linkRediectCreateByMessageAction,
      this.formSubmissionUpdateLastContactedAction,
    );
  }
}
