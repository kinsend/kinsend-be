import { Module } from '@nestjs/common';
import { AutomationModule } from '@app/modules/automation/automation.module';
import { FirstContactModule } from '@app/modules/first-contact/first-contact.module';
import { FormSubmissionModule } from '@app/modules/form.submission/form.submission.module';
import { KeywordResponseModule } from '@app/modules/keyword-response/keyword-response.module';
import { MessageModule } from '@app/modules/messages/message.module';
import { SmsLogModel } from '@app/modules/sms.log/sms.log.module';
import { UpdateModule } from '@app/modules/update/update.module';
import { UserModule } from '@app/modules/user/user.module';
import { SharedModule } from '@app/shared/shared.module';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsStatusCallbackHookAction } from './services/SmsStatusCallbackHookAction.service';
import { SmsHookController } from './sms.hook.controller';

export const MODULE_IMPORTS = [
  SharedModule,
  SmsLogModel,
  AutomationModule,
  UserModule,
  UpdateModule,
  FormSubmissionModule,
  MessageModule,
  FirstContactModule,
  KeywordResponseModule,
]

export const MODULE_PROVIDERS = [
  SmsReceiveHookAction,
  SmsStatusCallbackHookAction
]

export const MODULE_CONTROLLERS = [
  SmsHookController
]

@Module({
  imports: MODULE_IMPORTS,
  providers: MODULE_PROVIDERS,
  controllers: MODULE_CONTROLLERS
})
export class SmsHookModule {}
