/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Delay } from './dtos/AutomationCreatePayload.dto';
import { TASK_TYPE } from './interfaces/const';

export type TaskDocument = Task & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Task {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String })
  type: TASK_TYPE;

  @Prop({ type: String, required: false })
  message?: string;

  @Prop({ type: String, required: false })
  fileAttached?: string;

  @Prop({ required: false })
  delay?: Delay;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;
}

const TaskSchema = SchemaFactory.createForClass(Task);
export { TaskSchema };
