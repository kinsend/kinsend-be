/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Form } from '../form/form.schema';
import { Tags } from '../tags/tags.schema';
import { PhoneNumber } from '../user/dtos/UserResponse.dto';
import { User } from '../user/user.schema';

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

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Tags', required: false })
  tags?: Tags[];

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

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;

  @Prop({ default: false, type: Boolean })
  isContactHidden: boolean;

  @Prop({ default: false, type: Boolean })
  isContactArchived: boolean;

  @Prop({ default: true, type: Boolean })
  isSubscribed: boolean;

  @Prop({ default: false, type: Boolean })
  isFacebookContact: boolean;

  @Prop({ default: false, type: Boolean })
  isConversationArchived: boolean;

  @Prop({ default: false, type: Boolean })
  isConversationHidden: boolean;

  @Prop({ default: false, type: Boolean })
  isVip: boolean;

  @Prop({ type: Date, required: false })
  lastContacted?: Date;
}

const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);

FormSubmissionSchema.index({ email: 'text' });

export { FormSubmissionSchema };
