import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StripeService } from '../../shared/services/stripe.service';
import { AppRequest } from '../../utils/AppRequest';
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import { CreateSubscriptionByCustomerIdDto } from './dtos/CreateSubscriptionByCustomerId.dto';
import { SubscriptionCreateByCustomerIdAction } from './services/SubscriptionCreateByCustomerIdAction.service';
import { SubscriptionGetListAction } from './services/SubscriptionGetListAction.service';
import { SubscriptionGetPricesListAction } from './services/SubscriptionGetPricesListAction.service';
import { SubscriptionGetProductsListAction } from './services/SubscriptionGetProductsListAction.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthVerifyApiKey)
export class SubscriptionController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionGetListAction: SubscriptionGetListAction,
    private readonly subscriptionGetProductsListAction: SubscriptionGetProductsListAction,
    private readonly subscriptionGetPricesListAction: SubscriptionGetPricesListAction,
    private readonly subscriptionCreateByCustomerIdAction: SubscriptionCreateByCustomerIdAction,
  ) {}

  @Get('')
  async getSubscriptions(@Req() request: AppRequest) {
    return this.subscriptionGetListAction.execute(request);
  }

  @Post('')
  async createSubscriptionByCustomerId(
    @Req() request: AppRequest,
    @Body() payload: CreateSubscriptionByCustomerIdDto,
  ) {
    return this.subscriptionCreateByCustomerIdAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/products')
  async getProducts(@Req() request: AppRequest) {
    return this.subscriptionGetProductsListAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/prices')
  async getPrices(@Req() request: AppRequest) {
    return this.subscriptionGetPricesListAction.execute(request);
  }
}
