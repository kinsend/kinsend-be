import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';
import { STATUS } from 'src/domain/const';
import { PhoneNumber } from './dtos/UserCreateResponse.dto';

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
  phoneNumber: PhoneNumber;

  @Prop()
  oneSocial: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop()
  status: STATUS;

  @Prop()
  stripeCustomerUserId: string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export { UserSchema };
