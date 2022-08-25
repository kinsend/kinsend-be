/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { User } from '../user/user.schema';
import { Form } from '../form/form.schema';
import { PhoneNumber } from '../user/dtos/UserResponse.dto';

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class FormSubmission {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  owner: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Form', index: true })
  form: Form;

  @Prop({ required: false })
  email?: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: false })
  location?: string;

  @Prop()
  phoneNumber: PhoneNumber;

  @Prop({ required: false })
  metaData?: string;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;

  // TODO data for test
  @Prop({ default: true, type: Boolean })
  isContactHidden: boolean;

  @Prop({ default: true, type: Boolean })
  isContactArchived: boolean;

  @Prop({ default: true, type: Boolean })
  isSubscribed: boolean;

  @Prop({ default: true, type: Boolean })
  isFacebookContact: boolean;

  @Prop({ type: Date, required: false })
  lastContacted?: Date;
}

const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);

FormSubmissionSchema.index({ email: 'text' });

export { FormSubmissionSchema };
