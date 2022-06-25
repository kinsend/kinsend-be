/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { User } from '../user/user.schema';
import { DURATION, STATUS, TRIGGER_TYPE } from './interfaces/const';

export type AutomationDocument = Automation & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Automation {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  owner: User;

  @Prop()
  triggerType: TRIGGER_TYPE;

  @Prop({ default: STATUS.PENDING })
  status: STATUS;

  @Prop()
  @Transform(({ value }) => value.toString())
  userTaggedId: string;

  @Prop({ default: false })
  isStopTrigger: boolean;

  @Prop({ type: Date })
  dateTrigger: Date;

  @Prop({ required: false })
  timeZone?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ type: String, length: 160 })
  message: string;

  @Prop()
  duration: DURATION;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const AutomationSchema = SchemaFactory.createForClass(Automation);

AutomationSchema.index({ email: 'text' });

export { AutomationSchema };
