/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UpdateDocument } from '../update.schema';
import { UpdateTaggedTriggerAction } from './UpdateTriggerAction/UpdateTaggedTriggerAction';

@Injectable()
export class UpdateHandleTrigerAction {
  constructor(private updateTaggedTriggerAction: UpdateTaggedTriggerAction) {}

  async execute(context: RequestContext, update: UpdateDocument): Promise<void> {
    const { logger } = context;
    const { tagId } = update.filter;
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
  }
}
