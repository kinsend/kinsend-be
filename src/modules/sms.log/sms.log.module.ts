import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { SmsLogCreateAction } from './services/SmsLogCreateAction.service';
import { SmsLog, SmsLogSchema } from './sms.log.schema';

@Module({
  controllers: [],
  imports: [UserModule, MongooseModule.forFeature([{ name: SmsLog.name, schema: SmsLogSchema }])],
  providers: [SmsLogCreateAction],
  exports: [SmsLogCreateAction],
})
export class SmsLogModel {}
