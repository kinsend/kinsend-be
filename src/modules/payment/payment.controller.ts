import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { StripeService } from '../../shared/services/stripe.service';
import { RequestContext } from '../../utils/RequestContext';
import { PaymentAddCreditCardDto } from './dtos/PaymentAddCreditCard.dto';
import { PaymentCreateChargeDto } from './dtos/PaymentCreateCharge.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/credit-card')
  async addCreditCard(@Body() creditCard: PaymentAddCreditCardDto, @Req() request: RequestContext) {
    return this.stripeService.storedCreditCard(
      request,
      creditCard.paymentMethodId,
      request.user.stripeCustomerId,
    );
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
