/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { OPTIONAL_FIELDS } from './interfaces/form.interface';
import { Tags } from '../tags/tags.schema';
import { CustomFields } from '../custom.fields/custom.fields.schema';

export type FormDocument = Form & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Form {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop()
  image: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tags' })
  tags: Tags;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CustomFields' })
  customFields: CustomFields;

  @Prop({ unique: true })
  url: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ required: false })
  browserTitle?: string;

  @Prop({ required: false })
  redirectUrl?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [String], enum: OPTIONAL_FIELDS, required: false })
  optionalFields?: [OPTIONAL_FIELDS];

  @Prop({ required: false })
  submisstion?: string;

  @Prop({ required: false })
  isEnabled?: boolean;

  @Prop({ required: false })
  isVcardSend?: boolean;

  @Prop({ required: false })
  message?: string;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const FormSchema = SchemaFactory.createForClass(Form);

FormSchema.index({ userId: 'text', tagId: 'text', customFieldsId: 'text', url: 'text' });

export { FormSchema };
