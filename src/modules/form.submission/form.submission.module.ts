import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { AutomationModule } from '../automation/automation.module';
import { FormModule } from '../form/form.module';
import { UserModule } from '../user/user.module';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { FormSubmissionController } from './form.submission.controller';
import { FormSubmission, FormSubmissionSchema } from './form.submission.schema';
import { FormSubmissionCreateAction } from './services/FormSubmissionCreateAction.service';
import { FormSubmissionGetLocationsAction } from './services/FormSubmissionGetLocationsAction.service';
import { FormSubmissionsCountByIdsAction } from './services/FormSubmissionsCountByIdsAction.service';
import { FormSubmissionsFindByEmailAction } from './services/FormSubmissionsFindByEmailAction.service';
import { FormSubmissionFindByIdAction } from './services/FormSubmissionFindByIdAction.service';
import { FormSubmissionsGetAction } from './services/FormSubmissionsGetAction.service';
import { FormSubmissionsGetByLocationsAction } from './services/FormSubmissionsGetByLocationsAction.service';
import { FormSubmissionFindByPhoneNumberAction } from './services/FormSubmissionFindByPhoneNumberAction.service';
import { FormSubmissionFindByConditionAction } from './services/FormSubmissionFindByConditionAction.service';
import { FormSubmissionUpdateAction } from './services/FormSubmissionUpdateAction.service';
import { FormSubmissionUpdateLastContactedAction } from './services/FormSubmissionUpdateLastContactedAction.service';
import { FormSubmissionFindByIdsAction } from './services/FormSubmissionFindByIdsAction.service';

@Module({
  controllers: [FormSubmissionController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: FormSubmission.name, schema: FormSubmissionSchema }]),
    VirtualCardModule,
    AutomationModule,
    UserModule,
    forwardRef(() => FormModule),
  ],
  providers: [
    FormSubmissionCreateAction,
    FormSubmissionsFindByEmailAction,
    FormSubmissionsCountByIdsAction,
    FormSubmissionGetLocationsAction,
    FormSubmissionsGetAction,
    FormSubmissionFindByIdAction,
    FormSubmissionsGetByLocationsAction,
    FormSubmissionFindByPhoneNumberAction,
    FormSubmissionFindByConditionAction,
    FormSubmissionUpdateAction,
    FormSubmissionUpdateLastContactedAction,
    FormSubmissionFindByIdsAction,
  ],
  exports: [
    FormSubmissionsFindByEmailAction,
    FormSubmissionsCountByIdsAction,
    FormSubmissionFindByIdAction,
    FormSubmissionsGetByLocationsAction,
    FormSubmissionFindByPhoneNumberAction,
    FormSubmissionFindByConditionAction,
    FormSubmissionUpdateLastContactedAction,
    FormSubmissionFindByIdsAction,
  ],
})
export class FormSubmissionModule {}
