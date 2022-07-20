/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../../user/user.schema';
import { SegmentCreatePayload } from '../dtos/SegmentCreatePayload.dto';
import { Segment, SegmentDocument } from '../segment.schema';

@Injectable()
export class SegmentCreateAction {
  constructor(
    @InjectModel(Segment.name) private segmentModel: Model<SegmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(context: RequestContext, payload: SegmentCreatePayload): Promise<SegmentDocument> {
    const { user } = context;
    const userModel = new this.userModel({ ...user, _id: new mongoose.Types.ObjectId(user.id) });
    const segment = await new this.segmentModel({ ...payload, user: userModel }).save();
    return segment.populate([{ path: 'user', select: ['_id'] }]);
  }
}
