import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { FormModule } from '../form/form.module';
import { UserModule } from '../user/user.module';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { FormSubmissionController } from './form.submission.controller';
import { FormSubmission, FormSubmissionSchema } from './form.submission.schema';
import { FormSubmissionCreateAction } from './services/FormSubmissionCreateAction.service';

@Module({
  controllers: [FormSubmissionController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: FormSubmission.name, schema: FormSubmissionSchema }]),
    FormModule,
    UserModule,
    VirtualCardModule,
  ],
  providers: [FormSubmissionCreateAction],
  exports: [],
})
export class FormSubmissionModule {}
