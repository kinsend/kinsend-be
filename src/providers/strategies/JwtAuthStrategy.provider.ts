import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { ConfigService } from '../../configs/config.service';
import { AuthAccessTokenResponseDto } from '../../modules/auth/dtos/AuthTokenResponseDto';
import { tokenCacheKey } from '../../utils/cacheKeys';

type AccessTokenPayloadDto = AuthAccessTokenResponseDto;
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: AccessTokenPayloadDto): Promise<AuthAccessTokenResponseDto> {

    // TODO: [Refactor] You shouldn't rely on a local cacheManager to decide if a token is valid/expired or not.
    //       This will not work in HA environments, because the server on which we landed might not have the cache.
    //       Check gh/kinsend/kinsend-be#201

    const { sessionId, id } = payload;
    const cacheKey = tokenCacheKey(`${sessionId}-${id}`);
    const hasCache = await this.cacheManager.get(cacheKey);
    if (hasCache) {
      throw new UnauthorizedException(`Expired session : ${sessionId}`);
    }

    return payload;
  }
}
