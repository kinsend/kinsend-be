/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Update } from './update.schema';
import { FormSubmissionDocument } from '../form.submission/form.submission.schema';
import { LinkRedirectDocument } from './link.redirect.schema';

export type UpdateReportingDocument = UpdateReporting & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class UpdateReporting {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Update', index: true })
  update: Update;

  @Prop({ type: Number, default: 0 })
  recipients: number;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'FormSubmission', required: false })
  responded?: FormSubmissionDocument[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'LinkRedirect', required: false })
  clicked?: LinkRedirectDocument[];

  @Prop({ type: Number, default: 0 })
  deliveredNumbers: number;

  @Prop({ type: Number, default: 0 })
  deliveredBySms: number;

  @Prop({ type: Number, default: 0 })
  deliveredByMms: number;

  @Prop({ type: Number, default: 0 })
  byLocal: number;

  @Prop({ type: Number, default: 0 })
  byInternational: number;

  @Prop({ type: Number, default: 0 })
  optedOutResponded: number;

  @Prop({ type: Number, default: 0 })
  linkNumbers: number;

  @Prop({ type: Number, default: 0 })
  bounced: number;

  @Prop({ type: Number, default: 0 })
  cleaned: number;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;
}

const UpdateReportingSchema = SchemaFactory.createForClass(UpdateReporting);

export { UpdateReportingSchema };
