/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { UPDATE_PROGRESS } from './interfaces/const';
import { FormSubmission } from '../form.submission/form.submission.schema';
import { UpdateDocument } from './update.schema';

export type UpdateScheduleDocument = UpdateSchedule & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  collection: 'update_schedule',
})
export class UpdateSchedule {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  scheduleName: string;

  @Prop({ type: String, required: true })
  datetimeSchedule: string;

  @Prop({ type: String, required: true })
  ownerPhoneNumber: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'FormSubmission' })
  subscribers: FormSubmission[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Update' })
  update: UpdateDocument;

  @Prop({ type: Date })
  datetimeTrigger: Date;

  @Prop({ type: String, default: UPDATE_PROGRESS.SCHEDULED })
  status: UPDATE_PROGRESS;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

const UpdateScheduleSchema = SchemaFactory.createForClass(UpdateSchedule);

export { UpdateScheduleSchema };
