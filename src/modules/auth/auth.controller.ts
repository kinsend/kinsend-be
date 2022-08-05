/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/consistent-destructuring */
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import JwtRefreshGuard from '../../providers/guards/JwtRefreshGuard.provider';
import { LocalAuthGuard } from '../../providers/guards/LocalAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { AuthSignInAction } from './services/AuthSigninAction.service';
import { AuthVerifyTokenAction } from './services/AuthVerifyTokenAction.service';
import { AuthRefreshTokenPayloadDto } from './dtos/AuthRefreshTokenPayloadDto';
import { AuthVerifyTokenPayloadDto } from './dtos/AuthVerifyTokenPayloadDto';
import { AuthRefreshTokenAction } from './services/AuthRefreshTokenAction.service';
import { AuthBlackListTokenAction } from './services/AuthBlackListTokenAction.service';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AuthSigninProviderPayload } from './dtos/AuthSigninProviderPayloadDto';
import { SIGNIN_PROVIDER } from '../../domain/const';
import { AuthSigninProviderAction } from './services/AuthSigninProviderAction.service';

@ApiTags('Auths')
@Controller('api/auths')
export class AuthController {
  constructor(
    private authSignInAction: AuthSignInAction,
    private authVerifyTokenAction: AuthVerifyTokenAction,
    private authRefreshTokenAction: AuthRefreshTokenAction,
    private authBlackListTokenAction: AuthBlackListTokenAction,
    private authSigninProviderAction: AuthSigninProviderAction,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('')
  async signin(@Req() request: AppRequest) {
    const { user, accessToken, refreshToken } = await this.authSignInAction.execute(request);
    const { correlationId } = request;
    if (!user || !accessToken || !refreshToken) {
      throw new IllegalStateException(correlationId);
    }

    request.res?.setHeader('accessToken', accessToken);
    request.res?.setHeader('refreshToken', refreshToken);

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/provider/:provider')
  async signinByProvider(
    @Req() request: AppRequest,
    @Body() payload: AuthSigninProviderPayload,
    @Param('provider') provider: SIGNIN_PROVIDER,
  ) {
    const { user, accessToken, refreshToken } = await this.authSigninProviderAction.execute(
      request,
      provider,
      payload,
    );

    const { correlationId } = request;
    if (!user || !accessToken || !refreshToken) {
      throw new IllegalStateException(correlationId);
    }

    request.res?.setHeader('accessToken', accessToken);
    request.res?.setHeader('refreshToken', refreshToken);

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verifyToken(@Req() request: AppRequest, @Body() dto: AuthVerifyTokenPayloadDto) {
    return this.authVerifyTokenAction.execute(request, dto);
  }

  @ApiBody({ type: AuthRefreshTokenPayloadDto })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() request: AppRequest) {
    const { correlationId } = request;
    const { user, accessToken, refreshToken } = await this.authRefreshTokenAction.execute(request);
    if (!user || !accessToken || !refreshToken) {
      throw new IllegalStateException(correlationId);
    }
    request.res?.setHeader('accessToken', accessToken);
    request.res?.setHeader('refreshToken', refreshToken);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  @HttpCode(HttpStatus.OK)
  async blackList(@Req() request: AppRequest) {
    return this.authBlackListTokenAction.execute(request);
  }
}
