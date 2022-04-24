/* eslint-disable unicorn/consistent-destructuring */
import { Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from '@nestjs/common';
import { LocalAuthGuard } from '../../providers/guards/LocalAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { AuthSignInAction } from './AuthSignin/AuthSigninAction.service';

@Controller('auths')
export class AuthController {
  constructor(private authSignInAction: AuthSignInAction) {}

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
}
