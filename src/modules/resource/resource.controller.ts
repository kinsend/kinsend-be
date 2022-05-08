import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

@Controller('resources')
@ApiTags('Resources')
export class ResourceController {
  constructor(private smsService: SmsService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('available-phone-number')
  async getAvailablePhoneNumber(
    @Req() request: AppRequest,
    @Query() query: AvailablePhoneNumberQueryDto,
  ) {
    const { location, limit, useMock } = query;
   return this.smsService.availablePhoneNumberTollFree(request, location, limit, useMock);
  }
}
