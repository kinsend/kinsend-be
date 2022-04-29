import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/user.schema';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './payment.schema';
import { StoredCreditCardAction } from './services/StoredCreditCardAction.service';

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
  providers: [StoredCreditCardAction],
})
export class PaymentModule {}
