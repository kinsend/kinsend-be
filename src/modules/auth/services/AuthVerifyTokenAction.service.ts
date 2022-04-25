import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestContext } from '../../../utils/RequestContext';
import { AuthRefreshTokenResponseDto } from '../dtos/AuthRefreshTokenResponseDto';
import { AuthAccessTokenResponseDto } from '../dtos/AuthTokenResponseDto';
import { AuthVerifyTokenPayloadDto } from '../dtos/AuthVerifyTokenPayloadDto';

@Injectable()
export class AuthVerifyTokenAction {
  constructor(private jwtService: JwtService) {}

  async execute(
    context: RequestContext,
    payload: AuthVerifyTokenPayloadDto,
  ): Promise<AuthAccessTokenResponseDto | AuthRefreshTokenResponseDto> {
    const { token } = payload;
    return this.jwtService.verify(token);
  }
}
