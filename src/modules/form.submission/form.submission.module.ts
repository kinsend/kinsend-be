import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { AutomationModule } from '../automation/automation.module';
import { FormModule } from '../form/form.module';
import { UserModule } from '../user/user.module';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { FormSubmissionController } from './form.submission.controller';
import { FormSubmission, FormSubmissionSchema } from './form.submission.schema';
import { FormSubmissionCreateAction } from './services/FormSubmissionCreateAction.service';
import { FormSubmissionsFindByEmailAction } from './services/FormSubmissionsFindByEmailAction.service';

@Module({
  controllers: [FormSubmissionController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: FormSubmission.name, schema: FormSubmissionSchema }]),
    FormModule,
    VirtualCardModule,
    AutomationModule,
    UserModule,
  ],
  providers: [FormSubmissionCreateAction, FormSubmissionsFindByEmailAction],
  exports: [FormSubmissionsFindByEmailAction],
})
export class FormSubmissionModule {}
