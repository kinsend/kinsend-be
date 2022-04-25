import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { AuthRefreshTokenResponseDto } from '../../modules/auth/dtos/AuthRefreshTokenResponseDto';
import { tokenCacheKey } from '../../utils/cacheKeys';
import { RequestContext } from '../../utils/RequestContext';
import { ConfigService } from '../../configs/config.service';
import { UserCreateResponseDto } from '../../modules/user/dtos/UserCreateResponse.dto';
import { User, UserDocument } from '../../modules/user/user.schema';
import { UserFindByEmailAction } from '../../modules/user/services/UserFindByEmailAction.service';
import { UserFindByIdlAction } from '../../modules/user/services/UserFindByIdAction.service';

type RefreshTokenPayloadDto = AuthRefreshTokenResponseDto;

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userFindByIdlAction: UserFindByIdlAction,

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
  ): Promise<UserCreateResponseDto> {
    const { sessionId, id } = payload;
    const cacheKey = tokenCacheKey(`${sessionId}-${id}`);
    const hasCache = await this.cacheManager.get(cacheKey);
    if (hasCache) {
      throw new UnauthorizedException(`Expired session : ${sessionId}`);
    }
    const user = <UserCreateResponseDto>(<unknown>await this.userFindByIdlAction.execute(id));

    if (user) {
      return <UserCreateResponseDto>user;
    }

    throw new UnauthorizedException('Refresh token is not valid');
  }
}
