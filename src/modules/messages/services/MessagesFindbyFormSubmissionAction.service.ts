/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessagesFindbyFormSubmissionAction {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async execute(context: RequestContext, formId: string): Promise<MessageDocument[]> {
    const { user } = context;

    const messageColletion = await this.messageModel
      .find({ user: user.id, formSubmission: formId })
      .populate('formSubmission');

    return messageColletion;
  }
}
