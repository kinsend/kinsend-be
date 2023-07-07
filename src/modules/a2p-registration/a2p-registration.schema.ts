import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { REGISTRATION_STATUS } from 'src/domain/const';
import { User } from '../user/user.schema';

export type A2pRegistrationDocument = A2pRegistration & Document;
@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class A2pRegistration {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: String, default: REGISTRATION_STATUS.PENDING })
  progress: REGISTRATION_STATUS;

  @Prop({ type: String })
  error: string;
}

const A2pRegistrationSchema = SchemaFactory.createForClass(A2pRegistration);
export { A2pRegistrationSchema };
