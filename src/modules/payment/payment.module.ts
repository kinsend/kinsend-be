import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PaymentController } from './payment.controller';

@Module({
  controllers: [PaymentController],
  imports: [SharedModule],
})
export class PaymentModule {}
