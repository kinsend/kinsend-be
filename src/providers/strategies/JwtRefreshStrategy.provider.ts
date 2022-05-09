import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthRefreshTokenResponseDto } from '../../modules/auth/dtos/AuthRefreshTokenResponseDto';
import { tokenCacheKey } from '../../utils/cacheKeys';
import { RequestContext } from '../../utils/RequestContext';
import { ConfigService } from '../../configs/config.service';
import { UserResponseDto } from '../../modules/user/dtos/UserResponse.dto';
import { UserFindByIdAction } from '../../modules/user/services/UserFindByIdAction.service';

type RefreshTokenPayloadDto = AuthRefreshTokenResponseDto;

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userFindByIdlAction: UserFindByIdAction,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    context: RequestContext,
    payload: RefreshTokenPayloadDto,
  ): Promise<UserResponseDto> {
    const { sessionId, id } = payload;
    const cacheKey = tokenCacheKey(`${sessionId}-${id}`);
    const hasCache = await this.cacheManager.get(cacheKey);
    if (hasCache) {
      throw new UnauthorizedException(`Expired session : ${sessionId}`);
    }
    const user = <UserResponseDto>(<unknown>await this.userFindByIdlAction.execute(id));

    if (user) {
      return <UserResponseDto>user;
    }

    throw new UnauthorizedException('Refresh token is not valid');
  }
}
