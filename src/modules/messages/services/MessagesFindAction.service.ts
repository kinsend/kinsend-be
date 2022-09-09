/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { FormSubmissionFindByIdsAction } from '../../form.submission/services/FormSubmissionFindByIdsAction.service';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessagesFindAction {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private formSubmissionFindByIdsAction: FormSubmissionFindByIdsAction,
  ) {}

  async execute(context: RequestContext): Promise<any[]> {
    const { user } = context;
    const userId = new mongoose.Types.ObjectId(user.id);
    const listMessages = await this.messageModel.aggregate([
      { $match: { user: userId as any } },
      {
        $group: {
          _id: '$formSubmission',
          messages: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $sort: { 'messages.dateSent': -1 },
      },
    ]);
    const response: FormSubmissionDocument[] = [];
    const formSubmissionIds = listMessages.map((item) => item._id);
    const formSubmissions = await this.formSubmissionFindByIdsAction.execute(
      context,
      formSubmissionIds,
    );
    const messeagesLastest: MessageDocument[] = [];
    for (const item of listMessages) {
      messeagesLastest.push(item.messages[item.messages.length - 1]);
    }
    messeagesLastest.forEach((item) => {
      const formSub = formSubmissions.find(
        (sub) => item.formSubmission.toString() === sub._id.toString(),
      );
      if (!formSub) {
        return;
      }
      formSub.messages = [item];
      response.push(formSub);
    });
    return response;
  }
}
