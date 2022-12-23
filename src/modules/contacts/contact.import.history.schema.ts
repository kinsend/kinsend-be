/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';

export type ContactImportHistoryDocument = ContactImportHistory & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class ContactImportHistory {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  createdBy: User;

  @Prop({ required: true })
  numbersContact?: number;

  @Prop({ required: true })
  numbersContactImported: number;

  @Prop()
  numbersColumnMapped: number;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

const ContactImportHistorySchema = SchemaFactory.createForClass(ContactImportHistory);

export { ContactImportHistorySchema };
