/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { Segment, SegmentDocument } from '../segment.schema';

@Injectable()
export class SegmentFindByIdAction {
  constructor(@InjectModel(Segment.name) private segmentModel: Model<SegmentDocument>) {}

  async execute(context: RequestContext, id: string): Promise<SegmentDocument> {
    const segment = await this.segmentModel.findById(id);
    if (!segment) {
      throw new NotFoundException('Segment', 'Segment not found!');
    }
    return segment;
  }
}
