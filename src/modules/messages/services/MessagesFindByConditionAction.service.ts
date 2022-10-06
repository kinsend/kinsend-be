import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessagesFindByConditionAction {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async execute(filter: any): Promise<MessageDocument[]> {
    const msgs = await this.messageModel.find(filter);
    return msgs;
  }
}
