import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';
import { PhoneNumber } from './dtos/UserResponse.dto';
import { USER_PROVIDER } from './interfaces/user.interface';
import { STATUS } from '../../domain/const';
import { VCard } from '../virtualcard/virtual.card.schema';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ unique: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  phoneNumber: [PhoneNumber];

  @Prop()
  oneSocial: string;

  @Prop()
  provider: USER_PROVIDER;

  @Prop()
  @Exclude()
  password: string;

  @Prop()
  status: STATUS;

  @Prop()
  stripeCustomerUserId: string;

  @Prop({ required: false })
  isEnabledPayment?: boolean;

  @Prop({ required: false })
  isEnabledBuyPlan?: boolean;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: false })
  vCard?: VCard;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export { UserSchema };
