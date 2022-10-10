/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TYPE_PAYMENT } from '../../domain/const';
import { User } from '../user/user.schema';

export type PaymentMonthlyDocument = PaymentMonthly & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'payment_monthly',
})
export class PaymentMonthly {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  userId: User;

  @Prop({ required: false })
  chargeId: string;

  @Prop({ required: false })
  updateId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ type: Boolean, default: false })
  statusPaid: boolean;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: false })
  totalMessages?: number;

  @Prop({ required: false })
  totalSubs?: string;

  @Prop({ type: Date })
  datePaid: Date;

  @Prop({ type: String, required: true })
  typePayment: TYPE_PAYMENT;
}

const PaymentMonthlySchema = SchemaFactory.createForClass(PaymentMonthly);

PaymentMonthlySchema.index({ userId: 'text', statusPaid: 1 });

export { PaymentMonthlySchema };
