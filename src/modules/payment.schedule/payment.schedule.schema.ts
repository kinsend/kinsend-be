/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PAYMENT_PROGRESS } from '../../domain/const';
import { User } from '../user/user.schema';

export type PaymentScheduleDocument = PaymentSchedule & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'payment_schedule',
})
export class PaymentSchedule {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: String, required: true })
  customerId: string;

  @Prop({ type: String, required: true })
  scheduleName: string;

  @Prop({ type: String, default: PAYMENT_PROGRESS.SCHEDULED })
  progress: PAYMENT_PROGRESS;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: Number, required: true })
  pricePlan: number;

  @Prop({ required: true, type: Date })
  datetime: Date;

  @Prop({ required: true, type: Date })
  createdAt: Date;
}

const PaymentScheduleSchema = SchemaFactory.createForClass(PaymentSchedule);
PaymentScheduleSchema.index({ userId: 1 });

export { PaymentScheduleSchema };
