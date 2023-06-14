/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TaskDocument } from '../automation/task.schema';
import { Tags } from '../tags/tags.schema';
import { User } from '../user/user.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from './constant';
import { KeywordResponseDocument } from './keyword-response.schema';

export type AutoKeyWordResponseDocument = AutoKeyWordResponse & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'auto_keyword_response',
})
export class AutoKeyWordResponse {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KeywordResponse' })
  keywordResponse: KeywordResponseDocument;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tags', index: true, required: false })
  tag?: Tags;

  @Prop({ required: true, default: AUTO_KEYWORD_RESPONSE_TYPE.HASHTAG_OR_EMOJI })
  type: AUTO_KEYWORD_RESPONSE_TYPE;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  response: TaskDocument;

  @Prop({ type: String, required: true })
  pattern: string;

  @Prop({ type: Number, required: true })
  index: number;
}

const AutoKeyWordResponseSchema = SchemaFactory.createForClass(AutoKeyWordResponse);
export { AutoKeyWordResponseSchema };
