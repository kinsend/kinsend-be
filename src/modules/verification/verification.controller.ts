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
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { User as UserModel } from '../user/user.schema';
import { VerificationVerifyPhoneNumberAction } from './services/VerificationVerifyPhoneNumberAction.service';
import { VerificationConfirmPhoneNumberAction } from './services/VerificationConfirmPhoneNumberAction.service';

@ApiTags('Verifications')
@Controller('verifications')
@UseInterceptors(MongooseClassSerializerInterceptor(UserModel))
export class VerificationController {
  constructor(
    private verificationConfirmEmailAction: VerificationConfirmEmailAction,
    private verificationVerifyPhoneNumberAction: VerificationVerifyPhoneNumberAction,
    private verificationConfirmPhoneNumberAction: VerificationConfirmPhoneNumberAction,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('confirm')
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
    @Query() query: { useMock?: boolean },
  ) {
    return this.verificationVerifyPhoneNumberAction.execute(request, payload, query.useMock);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthVerifyApiKey)
  @Put('phone/confirm')
  async confirmPhone(
    @Req() request: AppRequest,
    @Body() payload: VerificationRequestPhoneNumberDto,
    @Query() query: { useMock?: boolean },
  ) {
    return this.verificationConfirmPhoneNumberAction.execute(request, payload, query.useMock);
  }
}
