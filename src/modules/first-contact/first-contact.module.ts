import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import {
  A2pRegistration,
  A2pRegistrationSchema,
} from '../a2p-registration/a2p-registration.schema';
import { Task, TaskSchema } from '../automation/task.schema';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { MessageModule } from '../messages/message.module';
import { UserModule } from '../user/user.module';
import { FirstContactController } from './first-contact.controller';
import { FirstContact, FirstContactSchema } from './first-contact.schema';
import { FirstContactCreateScheduleAction } from './services/first-contact-create-schedule-action.service';
import { FirstContactGetAction } from './services/first-contact-get-action.service';
import { FirstContactGetByUserIdAction } from './services/first-contact-get-by-user-id-action.service';
import { FistContactUpdateAction } from './services/first-contact-update-action.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: FirstContact.name, schema: FirstContactSchema },
      { name: Task.name, schema: TaskSchema },
      { name: A2pRegistration.name, schema: A2pRegistrationSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => FormSubmissionModule),
    forwardRef(() => MessageModule),
  ],
  providers: [
    FistContactUpdateAction,
    FirstContactGetAction,
    FirstContactGetByUserIdAction,
    FirstContactCreateScheduleAction,
  ],
  exports: [FirstContactGetByUserIdAction, FirstContactCreateScheduleAction],
  controllers: [FirstContactController],
})
export class FirstContactModule {}
