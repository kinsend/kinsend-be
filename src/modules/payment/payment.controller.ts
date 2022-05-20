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
import { PaymentCancelCreditCardAction } from './services/PaymentCancelCreditCardAction.service';
import { PaymentAttachCreditCardAction } from './services/PaymentAttachCreditCardAction.service';
import { PaymentUpdateDefaultMethodByCustomerIdAction } from './services/PaymentUpdateDefaultMethodByCustomerIdAction.service';
import { PaymentStoreAndConfirmCreditCardAction } from './services/PaymentStoreAndConfirmCreditCardAction.service';
import { PaymentAttachCreditCardToConsumerAction } from './services/PaymentAttachCreditCardToConsumerAction.service';

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
    private readonly paymentAttachCreditCardAction: PaymentAttachCreditCardAction,
    private readonly paymentUpdateDefaultMethodByCustomerIdAction: PaymentUpdateDefaultMethodByCustomerIdAction,
    private readonly paymentStoreAndConfirmCreditCardAction: PaymentStoreAndConfirmCreditCardAction,
    private readonly paymentAttachCreditCardToConsumerAction: PaymentAttachCreditCardToConsumerAction,
  ) {}

  @Post('/credit-card')
  async storedCreditCard(@Body() payload: PaymentStoredCreditCardDto, @Req() request: AppRequest) {
    return this.paymentStoredCreditCardAction.execute(request, payload);
  }

  @Post('/credit-card/setup-intent/:setupIntentId/confirm')
  async confirmCreditCard(
    @Req() request: AppRequest,
    @Param('setupIntentId') setupIntentId: string,
  ) {
    return this.paymentConfirmCreditCardAction.execute(request, setupIntentId);
  }

  // New version replace for api credit-card and confirm
  @Post('/credit-card/store-and-confirm')
  async storeAndConfirmCreditCard(
    @Body() payload: PaymentStoredCreditCardDto,
    @Req() request: AppRequest,
  ) {
    return this.paymentStoreAndConfirmCreditCardAction.execute(request, payload);
  }

  @Post('/credit-card/setup-intent/:setupIntentId/cancel')
  async cancelCreditCard(
    @Req() request: AppRequest,
    @Param('setupIntentId') setupIntentId: string,
  ) {
    return this.paymentCancelCreditCardAction.execute(request, setupIntentId);
  }

  @Post('/credit-card/payment-method/:paymentMethodId/customer-update')
  async updateDefaultPaymentMethodByCustomerId(
    @Req() request: AppRequest,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.paymentUpdateDefaultMethodByCustomerIdAction.execute(request, paymentMethodId);
  }

  @Post('/credit-card/payment-method/:paymentMethodId/attach')
  async attachPaymentMethodId(
    @Req() request: AppRequest,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.paymentAttachCreditCardAction.execute(request, paymentMethodId);
  }

  // New version replace for api attach and customer-update
  @Post('/credit-card/payment-method/:paymentMethodId/attach-consumer')
  async attachPaymentMethodForConsumer(
    @Req() request: AppRequest,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.paymentAttachCreditCardToConsumerAction.execute(request, paymentMethodId);
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
