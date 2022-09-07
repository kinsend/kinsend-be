/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { User } from '../user/user.schema';
import { FormSubmission } from '../form.submission/form.submission.schema';
import { PhoneNumber } from '../user/dtos/UserResponse.dto';

export type MessageDocument = Message & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
})
export class Message {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User' })
  user: User;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'FormSubmission' })
  formSubmission: FormSubmission;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, required: true })
  dateSent: Date;

  @Prop({ type: Number, required: false })
  errorCode: number;

  @Prop({ type: String, required: false })
  errorMessage: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  phoneNumberSent: PhoneNumber;
}

const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ status: 'text' });

export { MessageSchema };
