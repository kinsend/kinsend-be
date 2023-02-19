/* eslint-disable unicorn/filename-case */
/* eslint-disable import/newline-after-import */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';
import { PLAN_PAYMENT_METHOD, PLAN_SUBSCRIPTION_STATUS } from './plan-subscription.constant';

export type PlanSubscriptionDocument = PlanSubscription & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
  collection: 'subscription_plan',
})
export class PlanSubscription {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: String, required: true })
  priceId: string;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({
    type: String,
    required: true,
    enum: PLAN_SUBSCRIPTION_STATUS,
    default: PLAN_SUBSCRIPTION_STATUS.DEACTIVE,
  })
  status: string;

  @Prop({
    type: String,
    required: true,
    enum: PLAN_PAYMENT_METHOD,
    default: PLAN_PAYMENT_METHOD.MONTHLY,
  })
  planPaymentMethod: PLAN_PAYMENT_METHOD;

  @Prop({ required: false, type: Date })
  registrationDate: Date;
}

const PlanSubscriptionSchema = SchemaFactory.createForClass(PlanSubscription);
PlanSubscriptionSchema.index({ userId: 1 });

export { PlanSubscriptionSchema };
