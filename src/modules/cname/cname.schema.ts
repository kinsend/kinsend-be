/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { User } from '../user/user.schema';

export type CNAMEDocument = CNAME & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class CNAME {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user: User;

  @Prop()
  title: string;

  @Prop({ unique: true })
  value: string;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const CNAMESchema = SchemaFactory.createForClass(CNAME);

CNAMESchema.index({ value: 'text' });

export { CNAMESchema };
