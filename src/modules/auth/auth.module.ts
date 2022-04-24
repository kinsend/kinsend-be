import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalAuthStrategy } from '../../providers/strategies/LocalAuthStrategy.provider';
import { SharedModule } from '../../shared/shared.module';
import { User, UserSchema } from '../user/user.schema';
import { AuthController } from './auth.controller';
import { AuthSignInAction } from './AuthSignin/AuthSigninAction.service';
import { AuthValidateAction } from './AuthValidate/AuthValidateAction.service';

@Module({
  imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [LocalAuthStrategy, AuthSignInAction, AuthValidateAction],
  controllers: [AuthController],
})
export class AuthModule {}
