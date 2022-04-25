/* eslint-disable unicorn/consistent-destructuring */
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';
import { RequestContext } from '../../../utils/RequestContext';
import { AuthSignInResponseDto } from '../dtos/AuthSigninResponseDto';
import { AuthSignInAction } from './AuthSigninAction.service';

@Injectable()
export class AuthRefreshTokenAction {
  constructor(private authSignInAction: AuthSignInAction) {}

  async execute(context: RequestContext): Promise<AuthSignInResponseDto> {
    try {
      return await this.authSignInAction.execute(context);
    } catch {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
}
