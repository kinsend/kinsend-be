import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SmsService } from '../../shared/services/sms.service';
import { AppRequest } from '../../utils/AppRequest';
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import { AvailablePhoneNumberQueryDto } from './dtos/AvailablePhoneNumberQuery.dto';
import { BuyPhoneNumber } from './dtos/BuyPhoneNumber.dto';

@Controller('api/resources')
@ApiTags('Resources')
export class ResourceController {
  constructor(private smsService: SmsService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('available-phone-numbers')
  async getAvailablePhoneNumber(
    @Req() request: AppRequest,
    @Query() query: AvailablePhoneNumberQueryDto,
  ) {
    const { location, limit, phoneNumber, useMock, areaCode } = query;
    return this.smsService.availablePhoneNumberTollFree(
      request,
      location,
      limit,
      phoneNumber,
      areaCode,
      useMock,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('phone-numbers')
  async buyPhoneNumber(@Req() request: AppRequest, @Body() payload: BuyPhoneNumber) {
    return this.smsService.buyPhoneNumber(request, payload.phoneNumber);
  }
}
