import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtRefreshTokenStrategy } from '../../providers/strategies/JwtRefreshStrategy.provider';
import { LocalAuthStrategy } from '../../providers/strategies/LocalAuthStrategy.provider';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/user.schema';
import { AuthController } from './auth.controller';
import { AuthBlackListTokenAction } from './services/AuthBlackListTokenAction.service';
import { AuthRefreshTokenAction } from './services/AuthRefreshTokenAction.service';
import { AuthSignInAction } from './services/AuthSigninAction.service';
import { AuthValidateAction } from './services/AuthValidateAction.service';
import { AuthVerifyTokenAction } from './services/AuthVerifyTokenAction.service';
import { JwtAuthStrategy } from '../../providers/strategies/JwtAuthStrategy.provider';
import { AuthSigninByGoogleAction } from './services/AuthSigninByGoogleAction.service';
import { AuthSigninProviderAction } from './services/AuthSigninProviderAction.service';

@Module({
  imports: [
    SharedModule,
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    LocalAuthStrategy,
    JwtRefreshTokenStrategy,
    JwtAuthStrategy,
    AuthSignInAction,
    AuthValidateAction,
    AuthVerifyTokenAction,
    AuthRefreshTokenAction,
    AuthBlackListTokenAction,
    AuthSigninProviderAction,
    AuthSigninByGoogleAction,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
