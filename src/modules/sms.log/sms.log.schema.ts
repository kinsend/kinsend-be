import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

export type SmsLogDocument = SmsLog & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class SmsLog {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @Transform(({ value }) => value.toString())
  formUserId: string;

  @Prop()
  @Transform(({ value }) => value.toString())
  toUserId: string;

  @Prop()
  @Transform(({ value }) => value.toString())
  form: string;

  @Prop()
  @Transform(({ value }) => value.toString())
  to: string;

  @Prop({ required: false })
  metaData: string;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;
}

const SmsLogSchema = SchemaFactory.createForClass(SmsLog);

SmsLogSchema.index({ formUserId: 'text', toUserId: 'text' });

export { SmsLogSchema };
