import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { SmsLogCreateAction } from './services/SmsSendAction.service';

@Module({
  controllers: [],
  imports: [UserModule],
  providers: [SmsLogCreateAction],
  exports: [SmsLogCreateAction],
})
export class SmsLogModel {}
