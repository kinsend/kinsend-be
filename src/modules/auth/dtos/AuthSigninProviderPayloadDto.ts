import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { COOKIE_CONSENT } from '../../user/interfaces/user.interface';

export class AuthSigninProviderPayload {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsIn(Object.values(COOKIE_CONSENT))
  consent!: COOKIE_CONSENT;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cookieConsentCreatedAt!: string;
}
