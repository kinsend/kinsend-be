import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';
import { STATUS } from 'src/domain/const';

export type PaymentDocument = Payment & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Payment {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop()
  stripePaymentMethodId: string;

  @Prop()
  stripeSetupIntentId: string;

  @Prop()
  status: STATUS;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 'text', stripePaymentId: 'text', status: 'text' });

export { PaymentSchema };
