/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { UpdateModelUpdatePayload } from '../dtos/UpdateModelUpdatePayload.dto';
import { UpdateDocument } from '../update.schema';
import { UpdateFindByIdAction } from './UpdateFindByIdAction.service';

@Injectable()
export class UpdateModelUpdateAction {
  constructor(private updateFindByIdAction: UpdateFindByIdAction) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: UpdateModelUpdatePayload,
  ): Promise<UpdateDocument> {
    const update = await this.updateFindByIdAction.execute(context, id);

    const { message, filter, datetime, triggerType } = payload;
    if (message) {
      update.message = message;
    }

    if (datetime) {
      update.datetime = datetime;
    }

    if (triggerType) {
      update.triggerType = triggerType;
    }

    if (filter) {
      update.filter = filter;
    }

    return (await update.save()).populate([{ path: 'createdBy', select: ['_id'] }]);
  }
}
