/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-underscore-dangle */
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
  async execute(context: RequestContext): Promise<any[]> {
    const { user } = context;
    const userId = new mongoose.Types.ObjectId(user.id);
    const listMessages = await this.messageModel.aggregate([
      { $match: { user: userId as any } },
      {
        $group: {
          _id: '$formSubmission',
          message: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $sort: { 'message.dateSent': -1 },
      },
      {
        $replaceWith: {
          $setField: {
            field: 'message',
            input: '$$ROOT',
            value: { $last: '$message' },
          },
        },
      },
      {
        $lookup: {
          from: 'formsubmissions',
          localField: 'message.formSubmission',
          foreignField: '_id',
          as: 'formSubmission',
        },
      },
      {
        $set: {
          'formSubmission.message': '$message',
        },
      },
      {
        $unwind: '$formSubmission',
      },
      {
        $replaceRoot: {
          newRoot: '$formSubmission',
        },
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
        },
      },
      {
        $unset: ['message.formSubmission', 'message._id', 'message.user', '_id', 'owner', 'form'],
      },
    ]);
    return listMessages;
  }
}
