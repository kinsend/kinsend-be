/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from './auto-keyword-response.schema';

export type KeywordResponseDocument = KeywordResponse & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'keyword_response',
})
export class KeywordResponse {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: Boolean, required: true, default: true })
  isEnable: boolean;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'AutoKeyWordResponse',
    required: false,
    default: [],
  })
  autoKeywordResponses?: AutoKeyWordResponseDocument[];
}

const KeywordResponseSchema = SchemaFactory.createForClass(KeywordResponse);
export { KeywordResponseSchema };
