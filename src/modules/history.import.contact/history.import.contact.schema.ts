/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';

export type HistoryImportContactDocument = HistoryImportContact & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class HistoryImportContact {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  createdBy: User;

  @Prop({ required: false })
  numbersContact?: number;

  @Prop()
  numbersColumnMapped: number;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

const HistoryImportContactSchema = SchemaFactory.createForClass(HistoryImportContact);

export { HistoryImportContactSchema };
