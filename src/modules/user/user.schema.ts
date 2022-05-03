import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';
import { STATUS } from 'src/domain/const';
import { PhoneNumber } from './dtos/UserResponse.dto';
import { UserProvider } from './interfaces/user.interface';

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
  provider: UserProvider;

  @Prop()
  @Exclude()
  password: string;

  @Prop()
  status: STATUS;

  @Prop()
  stripeCustomerUserId: string;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export { UserSchema };
