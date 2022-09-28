import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { VerificationController } from './verification.controller';
import { VerificationConfirmEmailAction } from './services/VerificationConfirmEmailAction.service';
import { VerificationVerifyPhoneNumberAction } from './services/VerificationVerifyPhoneNumberAction.service';
import { VerificationConfirmPhoneNumberAction } from './services/VerificationConfirmPhoneNumberAction.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  controllers: [VerificationController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [
    VerificationConfirmEmailAction,
    VerificationVerifyPhoneNumberAction,
    VerificationConfirmPhoneNumberAction,
  ],
})
export class VerificationModule {}
