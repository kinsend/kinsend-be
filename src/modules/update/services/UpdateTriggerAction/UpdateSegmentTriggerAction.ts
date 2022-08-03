/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { filterDuplicateArray } from '../../../../utils/filterDuplicateArray';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { FormSubmissionsGetByLocationsAction } from '../../../form.submission/services/FormSubmissionsGetByLocationsAction.service';
import { FormGetSubmissionsByTagIds } from '../../../form/services/FormGetSubmissionsByTagIds';
import { Filter } from '../../../segment/dtos/SegmentCreatePayload.dto';
import { SegmentFindByIdAction } from '../../../segment/services/SegmentFindByIdAction.service';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateSegmentTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formSubmissionsGetByLocationsAction: FormSubmissionsGetByLocationsAction,
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private segmentFindByIdAction: SegmentFindByIdAction,
    private formGetSubmissionsByTagId: FormGetSubmissionsByTagIds,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
  ): Promise<void> {
    const { logger } = context;
    const { segmentId } = update.filter;
    if (!segmentId) {
      logger.info('Skip  update location trigger. Segment should not null.');
      return;
    }
    const segment = await this.getSegmentById(context, segmentId);
    const subscribers = await this.handleSegmentFilters(context, segment.filters);
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

  private getSegmentById(context: RequestContext, id: string) {
    return this.segmentFindByIdAction.execute(context, id);
  }

  private async getSubscriberByFilter(
    context: RequestContext,
    filters: Filter[],
  ): Promise<FormSubmission[]> {
    const subscribersResponse: FormSubmission[] = [];
    for (const filter of filters) {
      const { tagId, location, segmentId } = filter;
      if (tagId) {
        const subscribers = await this.formGetSubmissionsByTagId.execute(
          context,
          Array.isArray(tagId) ? tagId : [tagId],
        );
        subscribersResponse.push(...subscribers);
      }

      if (location) {
        const subscribers = await this.formSubmissionsGetByLocationsAction.execute(context, [
          location,
        ]);
        subscribersResponse.push(...subscribers);
      }

      if (segmentId) {
        const segment = await this.getSegmentById(context, segmentId);
        const subscribers = await this.handleSegmentFilters(context, segment.filters);
        subscribersResponse.push(...subscribers);
      }
    }
    // TODO: filter contacts
    return filterDuplicateArray(subscribersResponse);
  }

  private async handleSegmentFilters(context: RequestContext, filters: Filter[][]) {
    const subscribersResponse: FormSubmission[] = [];
    for (const filter of filters) {
      const subscribers = await this.getSubscriberByFilter(context, filter);
      subscribersResponse.push(...subscribers);
    }
    return filterDuplicateArray(subscribersResponse);
  }
}
