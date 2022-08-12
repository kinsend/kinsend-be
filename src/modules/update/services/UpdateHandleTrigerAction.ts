/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UpdateDocument } from '../update.schema';
import { UpdateContactsTriggerAction } from './UpdateTriggerAction/UpdateContactsTriggerAction';
import { UpdateLocationTriggerAction } from './UpdateTriggerAction/UpdateLocationTriggerAction';
import { UpdateSegmentTriggerAction } from './UpdateTriggerAction/UpdateSegmentTriggerAction';
import { UpdateTaggedTriggerAction } from './UpdateTriggerAction/UpdateTaggedTriggerAction';

@Injectable()
export class UpdateHandleTrigerAction {
  constructor(
    private updateTaggedTriggerAction: UpdateTaggedTriggerAction,
    private updateLocationTriggerAction: UpdateLocationTriggerAction,
    private updateSegmentTriggerAction: UpdateSegmentTriggerAction,
    private updateContactsTriggerAction: UpdateContactsTriggerAction
  ) {}

  async execute(context: RequestContext, update: UpdateDocument): Promise<void> {
    const { logger } = context;
    const { tagId, location, segmentId, key} = update.filter;
    const { phoneSystem } = update.createdBy;
    if (!phoneSystem || (phoneSystem as PhoneNumber[]).length === 0) {
      logger.info('Skip trigger update. Phone number is empty!');
      return;
    }
    const from = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;

    if (tagId) {
      logger.info('Start tag trigger update');
      this.updateTaggedTriggerAction.execute(context, from, update);
    }

    if (location) {
      logger.info('Start localtion trigger update');
      this.updateLocationTriggerAction.execute(context, from, update);
    }

    if (segmentId) {
      logger.info('Start segment trigger update');
      this.updateSegmentTriggerAction.execute(context, from, update);
    }
    // Contacts filter
    this.updateContactsTriggerAction.execute(context, from, update)
  }
}
