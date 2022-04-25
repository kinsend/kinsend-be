import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthAccessTokenResponseDto } from '../../modules/auth/dtos/AuthTokenResponseDto';

type UserAccessToken = AuthAccessTokenResponseDto;

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-auth') {
  handleRequest<TUser extends UserAccessToken>(
    error: Error,
    user: TUser,
    info: TokenExpiredError,
    context: ExecutionContext,
  ) {
    if (error || !user) {
      throw error || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
