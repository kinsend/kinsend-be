import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';
import { CUSTOM_FIELDS_TYPE } from '../../domain/const';

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

  @Prop({ unique: true })
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop()
  type: CUSTOM_FIELDS_TYPE;

  @Prop()
  label: string;

  @Prop()
  opstions: any;

  @Prop()
  isRequired: boolean;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const CustomFieldsSchema = SchemaFactory.createForClass(CustomFields);

CustomFieldsSchema.index({ userId: 'text', type: 'text' });

export { CustomFieldsSchema };
