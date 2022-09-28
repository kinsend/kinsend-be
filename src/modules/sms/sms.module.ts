import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { MessageModule } from '../messages/message.module';
import { UserModule } from '../user/user.module';
import { SmsSendAction } from './services/SmsSendAction.service';
import { SmsController } from './sms.controller';

@Module({
  controllers: [SmsController],
  imports: [UserModule, FormSubmissionModule, MessageModule, SharedModule],
  providers: [SmsSendAction],
  exports: [],
})
export class SmsModel {}
