import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Exclude, Transform, Type } from 'class-transformer';

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
  phoneNumber: number;

  @Prop()
  oneSocial: string;

  @Prop()
  @Exclude()
  password: string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ firstName: 'text', lastName: 'text' });

UserSchema.virtual('fullName').get(function (this: User) {
  return `${this.firstName} ${this.lastName}`;
});

export { UserSchema };
