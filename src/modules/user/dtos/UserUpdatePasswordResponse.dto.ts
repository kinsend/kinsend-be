import { AuthAccessTokenResponseDto } from 'src/modules/auth/dtos/AuthTokenResponseDto';

export class UserUpdatePasswordResponse {
  user!: AuthAccessTokenResponseDto;

  accessToken!: string;
}
