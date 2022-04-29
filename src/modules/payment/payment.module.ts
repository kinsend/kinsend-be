import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/user.schema';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentCancelCreditCardAction } from './services/PaymentCancelCreditCardAction.service';
import { PaymentConfirmCreditCardAction } from './services/PaymentConfirmCreditCardAction.service';
import { PaymentStoredCreditCardAction } from './services/PaymentStoredCreditCardAction.service';

@Module({
  controllers: [PaymentController],
  imports: [
    SharedModule,
    UserModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [
    PaymentStoredCreditCardAction,
    PaymentConfirmCreditCardAction,
    PaymentCancelCreditCardAction,
  ],
})
export class PaymentModule {}
