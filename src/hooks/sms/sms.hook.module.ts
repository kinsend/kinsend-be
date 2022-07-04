import { Module } from '@nestjs/common';
import { AutomationModule } from '../../modules/automation/automation.module';
import { SmsLogModel } from '../../modules/sms.log/sms.log.module';
import { UserModule } from '../../modules/user/user.module';
import { SharedModule } from '../../shared/shared.module';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsHookController } from './sms.hook.controller';

@Module({
  controllers: [SmsHookController],
  imports: [SharedModule, SmsLogModel, AutomationModule, UserModule],
  providers: [SmsReceiveHookAction],
  exports: [],
})
export class SmsHookModule {}
