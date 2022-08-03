/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '../../../configs/config.service';
import { getLinksInMessage, regexLink } from '../../../utils/getLinksInMessage';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../../user/user.schema';
import { UpdateCreatePayload } from '../dtos/UpdateCreatePayload.dto';
import { Update, UpdateDocument } from '../update.schema';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateHandleTrigerAction } from './UpdateHandleTrigerAction';

@Injectable()
export class UpdateCreateAction {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private updateHandleTrigerAction: UpdateHandleTrigerAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
  ) {}

  async execute(context: RequestContext, payload: UpdateCreatePayload): Promise<UpdateDocument> {
    const { user } = context;
    const userModel = new this.userModel({ ...user, _id: new mongoose.Types.ObjectId(user.id) });
    const update = await new this.updateModel({
      ...payload,
      messageReview: payload.message,
      createdBy: userModel,
    }).save();
    this.updateHandleTrigerAction.execute(context, update);
    const linkCreated = await this.linkRediectCreateByMessageAction.execute(
      context,
      update,
      undefined,
      true,
    );
    update.messageReview = linkCreated.messageReview;
    return update.populate([{ path: 'createdBy', select: ['_id'] }]);
  }
}
