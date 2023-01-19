import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { Task, TaskSchema } from '../automation/task.schema';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { MessageModule } from '../messages/message.module';
import { UserModule } from '../user/user.module';
import { AutoKeyWordResponse, AutoKeyWordResponseSchema } from './auto-keyword-response.schema';
import { FirstContactController } from './keyword-response.controller';
import { KeywordResponse, KeywordResponseSchema } from './keyword-response.schema';
import { AutoKeywordResponseCreateAction } from './services/auto-keyword-response-create-action.service';
import { AutoKeywordResponseDeleteAction } from './services/auto-keyword-response-delete-action.service';
import { AutoKeywordResponseGetLatestIndexAction } from './services/auto-keyword-response-get-latest-index-action.service';
import { AutoKeywordResponseUpdateAction } from './services/auto-keyword-response-update-action.service';
import { KeywordResponseGetAction } from './services/keyword-response-get-action.service';
import { KeywordResponseMessageCommingAction } from './services/keyword-response-message-comming-action.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: KeywordResponse.name, schema: KeywordResponseSchema },
      { name: AutoKeyWordResponse.name, schema: AutoKeyWordResponseSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => FormSubmissionModule),
    forwardRef(() => MessageModule),
  ],
  providers: [
    KeywordResponseGetAction,
    AutoKeywordResponseCreateAction,
    AutoKeywordResponseGetLatestIndexAction,
    AutoKeywordResponseUpdateAction,
    AutoKeywordResponseDeleteAction,
    KeywordResponseMessageCommingAction,
  ],
  exports: [KeywordResponseMessageCommingAction],
  controllers: [FirstContactController],
})
export class KeywordResponseModule {}
