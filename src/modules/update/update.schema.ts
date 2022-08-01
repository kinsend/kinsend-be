/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { User } from '../user/user.schema';
import { INTERVAL_TRIGGER_TYPE, UPDATE_PROGRESS } from './interfaces/const';
import { Filter } from '../segment/dtos/SegmentCreatePayload.dto';
import { FormSubmission } from '../form.submission/form.submission.schema';

export type UpdateDocument = Update & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Update {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  createdBy: User;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'FormSubmission', index: true })
  recipients: FormSubmission[];

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, required: false })
  fileUrl?: string;

  @Prop({ required: true })
  filter: Filter;

  @Prop({ required: true, type: Date })
  datetime: Date;

  @Prop({ required: true, default: INTERVAL_TRIGGER_TYPE.EVERY_DAY })
  triggerType: INTERVAL_TRIGGER_TYPE;

  @Prop({ type: String, default: UPDATE_PROGRESS.SCHEDULED })
  progress: UPDATE_PROGRESS;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;
}

const UpdateSchema = SchemaFactory.createForClass(Update);
UpdateSchema.index({ triggerType: 'text', progress: 'text', message: 'text' });

export { UpdateSchema };
