/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { UpdateReportingPayload } from '../../dtos/UpdateReportingPayload.dto';
import { UpdateReporting, UpdateReportingDocument } from '../../update.reporting.schema';
import { UpdateDocument } from '../../update.schema';
import { UpdateReportingFindByUpdateIdAction } from './UpdateReportingFindByUpdateIdAction.service';
import { UpdateReportingUpdateAction } from './UpdateReportingUpdateAction.service';

@Injectable()
export class UpdateReportingUpdateByResponseAction {
  constructor(
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
    private updateReportingFindByUpdateIdAction: UpdateReportingFindByUpdateIdAction,
    private updateReportingUpdateAction: UpdateReportingUpdateAction,
  ) {}

  async execute(
    context: RequestContext,
    updates: UpdateDocument[],
    subscriber: FormSubmission,
    messageResponse: string,
  ): Promise<void> {
    updates.forEach((update) => {
      this.updateReporting(context, update, subscriber, messageResponse);
    });
  }

  async updateReporting(
    context: RequestContext,
    update: UpdateDocument,
    subscriber: FormSubmission,
    messageResponse: string,
  ): Promise<void> {
    const { id } = update;
    try {
      const reporting = await this.updateReportingFindByUpdateIdAction.execute(context, id);
      const payload: UpdateReportingPayload = {};
      if (messageResponse.toLowerCase() === 'stop') {
        payload.bounced = reporting.bounced + 1;
      }
      payload.responded = [...(reporting.responded || []), subscriber];
      this.updateReportingUpdateAction.execute(context, id, payload);
    } catch (error) {
      context.logger.error({
        message: 'Update reporting fail!',
        updateId: id,
        error,
      });
    }
  }
}
