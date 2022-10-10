import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { PaymentSchedule, PaymentScheduleSchema } from './payment.schedule.schema';
import { PaymentScheduleCreateAction } from './services/PaymentScheduleCreateAction.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: PaymentSchedule.name, schema: PaymentScheduleSchema }]),
  ],
  providers: [PaymentScheduleCreateAction],
  exports: [PaymentScheduleCreateAction],
})
export class PaymentScheduleModule {}
