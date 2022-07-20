/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Segment, SegmentDocument } from '../segment.schema';

@Injectable()
export class SegmentFindAction {
  constructor(@InjectModel(Segment.name) private segmentModel: Model<SegmentDocument>) {}

  async execute(context: RequestContext): Promise<SegmentDocument[]> {
    const { user } = context;
    return this.segmentModel.find({
      user: user.id,
    });
  }
}
