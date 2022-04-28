import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PaymentController } from './payment.controller';
import { StoredCreditCardAction } from './services/StoredCreditCardAction.service';

@Module({
  controllers: [PaymentController],
  imports: [SharedModule],
  providers: [StoredCreditCardAction],
})
export class PaymentModule {}
