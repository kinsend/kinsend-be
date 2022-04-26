import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared/shared.module';
import { User, UserSchema } from '../user/user.schema';
import { VerificationController } from './verification.controller';
import { VerificationConfirmEmailAction } from './services/VerificationConfirmEmailAction.service';
import { VerificationRequestVerifyPhoneNumberAction } from './services/VerificationRequestVerifyPhoneNumberAction.service';
import { VerificationRequestConfirmPhoneNumberAction } from './services/VerificationRequestConfirmPhoneNumberAction.service';

@Module({
  controllers: [VerificationController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [
    VerificationConfirmEmailAction,
    VerificationRequestVerifyPhoneNumberAction,
    VerificationRequestConfirmPhoneNumberAction,
  ],
})
export class VerificationModule {}
