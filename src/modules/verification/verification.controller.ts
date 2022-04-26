/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppRequest } from 'src/utils/AppRequest';
import { VerificationConfirmEmailAction } from './services/VerificationConfirmEmailAction.service';
import { VerificationConfirmEmailQueryDto } from './dtos/VerificationConfirmEmailQuery.dto';
import { VerificationRequestPhoneNumberDto } from './dtos/VerificationRequestPhoneNumber.dto';
import { VerificationRequestVerifyPhoneNumberAction } from './services/VerificationRequestVerifyPhoneNumberAction.service';
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import { VerificationRequestConfirmPhoneNumberAction } from './services/VerificationRequestConfirmPhoneNumberAction.service';

@ApiTags('Verifications')
@Controller('verifications')
export class VerificationController {
  constructor(
    private verificationConfirmEmailAction: VerificationConfirmEmailAction,
    private verificationRequestVerifyPhoneNumberAction: VerificationRequestVerifyPhoneNumberAction,
    private verificationRequestConfirmPhoneNumberAction: VerificationRequestConfirmPhoneNumberAction,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('email')
  async confirm(@Req() request: AppRequest, @Query() query: VerificationConfirmEmailQueryDto) {
    return this.verificationConfirmEmailAction.execute(request, query);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthVerifyApiKey)
  @Put('phone/verify')
  async verifyPhone(
    @Req() request: AppRequest,
    @Body() payload: VerificationRequestPhoneNumberDto,
  ) {
    return this.verificationRequestVerifyPhoneNumberAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthVerifyApiKey)
  @Put('phone/confirm')
  async confirmPhone(
    @Req() request: AppRequest,
    @Body() payload: VerificationRequestPhoneNumberDto,
  ) {
    return this.verificationRequestConfirmPhoneNumberAction.execute(request, payload);
  }
}
