/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../../user/user.schema';
import { UpdateCreatePayload } from '../dtos/UpdateCreatePayload.dto';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateCreateAction {
  constructor(
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(context: RequestContext, payload: UpdateCreatePayload): Promise<UpdateDocument> {
    const { user } = context;
    const userModel = new this.userModel({ ...user, _id: new mongoose.Types.ObjectId(user.id) });
    const update = await new this.updateModel({ ...payload, createdBy: userModel }).save();
    return update.populate([{ path: 'createdBy', select: ['_id'] }]);
  }
}
