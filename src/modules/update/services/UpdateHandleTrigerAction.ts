/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { Filter } from '../../segment/dtos/SegmentCreatePayload.dto';
import { FILTERS_CONTACT } from '../../segment/interfaces/const';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UserDocument } from '../../user/user.schema';
import { UpdateDocument } from '../update.schema';
import { UpdateFindAction } from './UpdateFindAction.service';
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
    private updateContactsTriggerAction: UpdateContactsTriggerAction,
    private updateFindAction: UpdateFindAction,
  ) {}

  async execute(
    context: RequestContext,
    update: UpdateDocument,
    filter: Filter,
    createdBy: UserDocument,
    skip?: number,
  ): Promise<void> {
    const { logger } = context;
    const { tagId, location, segmentId, key } = filter;
    const { phoneSystem } = createdBy;
    if (!phoneSystem || (phoneSystem as PhoneNumber[]).length === 0) {
      logger.info('Skip trigger update. Phone number is empty!');
      return;
    }
    const from = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;

    if (tagId) {
      logger.info('Start tag trigger update');
      this.updateTaggedTriggerAction.execute(context, from, update, tagId);
      return;
    }

    if (location) {
      logger.info('Start localtion trigger update');
      this.updateLocationTriggerAction.execute(context, from, update, location);
      return;
    }

    if (segmentId) {
      logger.info('Start segment trigger update');
      this.updateSegmentTriggerAction.execute(context, from, update, segmentId);
      return;
    }
    // case lastest update
    if (key === FILTERS_CONTACT.RECEIVED_LATEST_UPDATE) {
      logger.info('Start Received Latest Update');
      const nextSkip = skip !== undefined ? skip + 1 : 0;
      const updateLatest = await this.updateFindAction.execute(context, {
        limit: 1,
        skip: nextSkip,
      });
      if (updateLatest.length === 0) {
        return;
      }
      this.execute(context, update, updateLatest[0].filter, createdBy, nextSkip);
      return;
    }
    // Contacts filter
    this.updateContactsTriggerAction.execute(context, from, update, filter);
  }
}
