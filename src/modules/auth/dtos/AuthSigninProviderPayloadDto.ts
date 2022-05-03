import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { CookieConsent } from '../../user/interfaces/user.interface';

export class AuthSigninProviderPayload {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsIn(Object.values(CookieConsent))
  consent!: CookieConsent;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cookieConsentCreatedAt!: string;
}
