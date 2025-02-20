import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { AutomationModule } from '../automation/automation.module';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { FormSubmission, FormSubmissionSchema } from '../form.submission/form.submission.schema';
import { TagsCreateAction } from '../tags/services/TagsCreateAction.service';
import { TagsSearchByName } from '../tags/services/TagsSearchByNameAction.service';
import { TagsModule } from '../tags/tags.module';
import { Tags, TagsSchema } from '../tags/tags.schema';
import { UserModule } from '../user/user.module';
import { HistoryImportContactController } from './contact.controller';
import { ContactImportHistory, ContactImportHistorySchema } from './contact.import.history.schema';
import { ContactImportAction } from './services/ContactImportAction.service';
import { ContactImportHistoryCreateAction } from './services/ContactImportHistoryCreateAction.service';
import { HistoryImportContactGetByUserIdAction } from './services/HistoryImportContactGetByUserIdAction.service';

@Module({
  controllers: [HistoryImportContactController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      {
        name: ContactImportHistory.name,
        schema: ContactImportHistorySchema,
        collection: 'contact_import_history',
      },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: Tags.name, schema: TagsSchema },
    ]),
    FormSubmissionModule,
    UserModule,
    AutomationModule,
    TagsModule,
  ],
  providers: [
    ContactImportHistoryCreateAction,
    HistoryImportContactGetByUserIdAction,
    ContactImportAction,
    TagsCreateAction,
    TagsSearchByName,
  ],
  exports: [ContactImportHistoryCreateAction],
})
export class HistoryImportContactModule {}
