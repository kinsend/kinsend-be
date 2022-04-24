import { AuthAccessTokenResponseDto } from './AuthTokenResponseDto';

export class AuthSignInResponseDto {
  user!: AuthAccessTokenResponseDto;

  accessToken!: string;

  refreshToken!: string;
}
