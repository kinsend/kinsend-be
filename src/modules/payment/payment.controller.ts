import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { StripeService } from '../../shared/services/stripe.service';
import { RequestContext } from '../../utils/RequestContext';
import { PaymentStoredCreditCardDto } from './dtos/PaymentStoredCreditCard.dto';
import { PaymentCreateChargeDto } from './dtos/PaymentCreateCharge.dto';
import { StoredCreditCardAction } from './services/StoredCreditCardAction.service';
import { AppRequest } from '../../utils/AppRequest';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly storedCreditCardAction: StoredCreditCardAction,
  ) {}

  @Post('/credit-card')
  async storedCreditCard(@Body() payload: PaymentStoredCreditCardDto, @Req() request: AppRequest) {
    return this.storedCreditCardAction.execute(request, payload);
  }

  @Get('/list-credit-cards')
  async getCreditCards(@Req() request: RequestContext) {
    return this.stripeService.listStoredCreditCards(request, request.user.stripeCustomerId);
  }

  @Post('/charge')
  async createCharge(@Body() payload: PaymentCreateChargeDto, @Req() request: RequestContext) {
    const { amount, paymentMethodId } = payload;
    return this.stripeService.chargePaymentUser(
      request,
      amount,
      paymentMethodId,
      request.user.stripeCustomerId,
    );
  }
}
