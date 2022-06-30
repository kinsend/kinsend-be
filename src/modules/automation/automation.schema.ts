/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { AUTOMATION_STATUS, TRIGGER_TYPE } from './interfaces/const';
import { Task, TaskDocument } from './task.schema';
import { Tags } from '../tags/tags.schema';
import { User } from '../user/user.schema';

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

  @Prop({ type: String })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user: User;

  @Prop()
  triggerType: TRIGGER_TYPE;

  @Prop({ required: false })
  stopTriggerType?: TRIGGER_TYPE;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Tags', index: true, required: false })
  taggedTags?: [Tags];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Tags', index: true, required: false })
  stopTaggedTags?: [Tags];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Task' })
  tasks: [TaskDocument];

  @Prop({ required: true, default: AUTOMATION_STATUS.ENABLE })
  status: AUTOMATION_STATUS;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const AutomationSchema = SchemaFactory.createForClass(Automation);
AutomationSchema.index({ triggerType: 'text' });

export { AutomationSchema };
