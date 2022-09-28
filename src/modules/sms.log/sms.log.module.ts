import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { SmsLogCreateAction } from './services/SmsLogCreateAction.service';
import { SmsLogsGetByFromAction } from './services/SmsLogsGetByFromAction.service';
import { SmsLog, SmsLogSchema } from './sms.log.schema';

@Module({
  controllers: [],
  imports: [UserModule, MongooseModule.forFeature([{ name: SmsLog.name, schema: SmsLogSchema }])],
  providers: [SmsLogCreateAction, SmsLogsGetByFromAction],
  exports: [SmsLogCreateAction, SmsLogsGetByFromAction],
})
export class SmsLogModel {}
