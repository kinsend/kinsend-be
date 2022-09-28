/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { Filter } from '../dtos/SegmentCreatePayload.dto';
import { SegmentUpdatePayload } from '../dtos/SegmentUpdatePayload.dto';
import { SegmentDocument } from '../segment.schema';
import { SegmentFindByIdAction } from './SegmentFindByIdAction.service';

@Injectable()
export class SegmentUpdateAction {
  constructor(private segmentFindByIdAction: SegmentFindByIdAction) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: SegmentUpdatePayload,
  ): Promise<SegmentDocument> {
    const segment = await this.segmentFindByIdAction.execute(context, id);

    const { name, filters } = payload;
    if (name) {
      segment.name = name;
    }
    if (filters && filters[0].length > 0) {
      segment.filters = filters as [[Filter]];
    }
    return (await segment.save()).populate([{ path: 'user', select: ['_id'] }]);
  }
}
