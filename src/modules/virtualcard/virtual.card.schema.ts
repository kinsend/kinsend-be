import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

export type VCardDocument = VCard & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class VCard {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ unique: true })
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop({ unique: true })
  email?: string;

  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ required: false })
  organization?: string;

  @Prop({ required: false })
  facebook?: string;

  @Prop({ required: false })
  instagram?: string;

  @Prop({ required: false })
  twitter?: string;

  @Prop({ required: false })
  linkedIn?: string;

  @Prop({ required: false })
  youtube?: string;

  @Prop({ required: false })
  snapchat?: string;

  @Prop({ required: false })
  soundCloud?: string;

  @Prop({ required: false })
  store?: string;

  @Prop({ required: false })
  website?: string;

  @Prop({ required: false })
  zipCode?: string;

  @Prop({ required: false })
  note?: string;

  @Prop({ required: false })
  url?: string;

  @Prop({ required: false })
  cellphone?: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

const VCardSchema = SchemaFactory.createForClass(VCard);

VCardSchema.index({ firstName: 'text', lastName: 'text', email: 'text', userId: 'text' });

export { VCardSchema };
