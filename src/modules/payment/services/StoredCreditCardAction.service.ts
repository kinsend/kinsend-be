import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { AppRequest } from '../../../utils/AppRequest';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';
import { PaymentStoredCreditCardDto } from '../dtos/PaymentStoredCreditCard.dto';

@Injectable()
export class StoredCreditCardAction {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async execute(context: AppRequest, payload: PaymentStoredCreditCardDto): Promise<void> {
    const { authorization } = context.headers;
    const token = authorization?.split(' ')[1];

    try {
      const result = await this.stripeService.storedCreditCard(
        context,
        payload.paymentMethod.id,
        '',
      );
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
  }
}
