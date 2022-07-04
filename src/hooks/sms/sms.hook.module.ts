import { Module } from '@nestjs/common';
import { SmsLogModel } from '../../modules/sms.log/sms.log.module';
import { SharedModule } from '../../shared/shared.module';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsHookController } from './sms.hook.controller';

@Module({
  controllers: [SmsHookController],
  imports: [SharedModule, SmsLogModel],
  providers: [SmsReceiveHookAction],
  exports: [],
})
export class SmsHookModule {}
