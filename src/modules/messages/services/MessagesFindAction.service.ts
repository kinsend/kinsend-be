/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessagesFindAction {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async execute(context: RequestContext): Promise<MessageDocument[]> {
    const { user } = context;
    const userId = new mongoose.Types.ObjectId(user.id);

    const listMessages = await this.messageModel
      .find({ user: userId })
      .populate([{ path: 'user', select: ['-password'] }, { path: 'formSubmission' }]);

    return listMessages;
  }
}
