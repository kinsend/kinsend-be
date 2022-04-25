import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtRefreshTokenStrategy } from '../../providers/strategies/JwtRefreshStrategy.provider';
import { LocalAuthStrategy } from '../../providers/strategies/LocalAuthStrategy.provider';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/user.schema';
import { UserFindByIdlAction } from '../user/UserFindById/UserFindByIdAction.service';
import { AuthController } from './auth.controller';
import { AuthBlackListTokenAction } from './services/AuthBlackListTokenAction.service';
import { AuthRefreshTokenAction } from './services/AuthRefreshTokenAction.service';
import { AuthSignInAction } from './services/AuthSigninAction.service';
import { AuthValidateAction } from './services/AuthValidateAction.service';
import { AuthVerifyTokenAction } from './services/AuthVerifyTokenAction.service';

@Module({
  imports: [
    SharedModule,
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    LocalAuthStrategy,
    JwtRefreshTokenStrategy,
    AuthSignInAction,
    AuthValidateAction,
    AuthVerifyTokenAction,
    AuthRefreshTokenAction,
    AuthBlackListTokenAction,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
