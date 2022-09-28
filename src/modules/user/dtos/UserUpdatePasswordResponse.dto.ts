import { AuthAccessTokenResponseDto } from '../../auth/dtos/AuthTokenResponseDto';

export class UserUpdatePasswordResponse {
  user!: AuthAccessTokenResponseDto;

  accessToken!: string;
}
