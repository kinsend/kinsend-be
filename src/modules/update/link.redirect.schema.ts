/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Update } from './update.schema';
import { FormSubmissionDocument } from '../form.submission/form.submission.schema';

export type LinkRedirectDocument = LinkRedirect & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class LinkRedirect {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Update', index: true })
  update: Update;

  @Prop({ type: String, required: true, unique: true })
  url: string;

  @Prop({ type: String, required: true })
  redirect: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'FormSubmission', required: false })
  clicked?: FormSubmissionDocument[];

  @Prop({ type: Boolean, required: false })
  isClicked: boolean;

  @Prop({ type: Boolean, required: false })
  isRoot: boolean;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;
}

const LinkRedirectSchema = SchemaFactory.createForClass(LinkRedirect);
LinkRedirectSchema.index({ url: 'text' });

export { LinkRedirectSchema };
