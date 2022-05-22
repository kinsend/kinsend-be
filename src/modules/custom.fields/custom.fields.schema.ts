/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';
import { CUSTOM_FIELDS_TYPE } from './interfaces/custom.fields.interface';
import { Options } from './dtos/CustomFieldsCreatePayload.dto';

export type CustomFieldsDocument = CustomFields & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class CustomFields {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop({ enum: CUSTOM_FIELDS_TYPE })
  type: string;

  @Prop()
  tag: string;

  @Prop()
  label: string;

  @Prop()
  placeholder: string;

  @Prop()
  isRequired: boolean;

  @Prop()
  options: [Options];

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const CustomFieldsSchema = SchemaFactory.createForClass(CustomFields);

CustomFieldsSchema.index({ userId: 'text', type: 'text' });

export { CustomFieldsSchema };
