import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessageUpdateManyAction {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async execute(ids: string[], payload: any): Promise<void> {
    await this.messageModel.updateMany(
      {
        _id: { $in: ids },
      },
      { $set: payload },
    );
  }
}
