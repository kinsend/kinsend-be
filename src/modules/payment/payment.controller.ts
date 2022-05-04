import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { StripeService } from '../../shared/services/stripe.service';
import { RequestContext } from '../../utils/RequestContext';
import { PaymentStoredCreditCardDto } from './dtos/PaymentStoredCreditCard.dto';
import { PaymentCreateChargeDto } from './dtos/PaymentCreateCharge.dto';
import { PaymentStoredCreditCardAction } from './services/PaymentStoredCreditCardAction.service';
import { AppRequest } from '../../utils/AppRequest';
import { PaymentConfirmCreditCardAction } from './services/PaymentConfirmCreditCardAction.service';
import { PaymentConfirmCreditCardDto } from './dtos/PaymentConfirmCreditCard.dto';
import { PaymentCancelCreditCardAction } from './services/PaymentCancelCreditCardAction.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentStoredCreditCardAction: PaymentStoredCreditCardAction,
    private readonly paymentConfirmCreditCardAction: PaymentConfirmCreditCardAction,
    private readonly paymentCancelCreditCardAction: PaymentCancelCreditCardAction,
  ) {}

  @Post('/credit-card')
  async storedCreditCard(@Body() payload: PaymentStoredCreditCardDto, @Req() request: AppRequest) {
    return this.paymentStoredCreditCardAction.execute(request, payload);
  }

  @Post('/credit-card/:setupIntentId/confirm')
  async confirmCreditCard(
    @Req() request: AppRequest,
    @Param('setupIntentId') setupIntentId: string,
  ) {
    return this.paymentConfirmCreditCardAction.execute(request, setupIntentId);
  }

  @Post('/credit-card/:setupIntentId/cancel')
  async cancelCreditCard(
    @Req() request: AppRequest,
    @Param('setupIntentId') setupIntentId: string,
  ) {
    return this.paymentCancelCreditCardAction.execute(request, setupIntentId);
  }

  @Get('/credit-cards')
  async getCreditCards(@Req() request: RequestContext) {
    return this.stripeService.listStoredCreditCards(request, request.user.stripeCustomerId);
  }

  @Post('/credit-card/charge')
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
