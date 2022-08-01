/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmissionsGetByLocationsAction } from '../../../form.submission/services/FormSubmissionsGetByLocationsAction.service';
import { UpdateDocument } from '../../update.schema';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateLocationTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formSubmissionsGetByLocationsAction: FormSubmissionsGetByLocationsAction,
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
  ): Promise<void> {
    const { logger } = context;
    const { location } = update.filter;
    if (!location) {
      logger.info('Skip  update location trigger. Location should not null.');
      return;
    }
    const subscribers = await this.formSubmissionsGetByLocationsAction.execute(context, [location]);
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
    );
  }
}
