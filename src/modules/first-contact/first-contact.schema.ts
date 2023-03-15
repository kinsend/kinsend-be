/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PAYMENT_PROGRESS } from '../../domain/const';
import { TaskDocument } from '../automation/task.schema';
import { User } from '../user/user.schema';

export type FirstContactDocument = FirstContact & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'first_contact',
})
export class FirstContact {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: Boolean, required: true, default: false })
  isEnable: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  firstTask: TaskDocument;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  reminderTask: TaskDocument;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;
}

const FirstContactSchema = SchemaFactory.createForClass(FirstContact);
export { FirstContactSchema };
