/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { VerificationConfirmEmailAction } from './VerificationConfirmEmail/VerificationConfirmEmailAction.service';
import { VerificationConfirmEmailQueryDto } from './VerificationConfirmEmail/VerificationConfirmEmailQuery.dto';

@ApiTags('Verifications')
@Controller('verifications')
export class VerificationController {
  constructor(private verificationConfirmEmailAction: VerificationConfirmEmailAction) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('confirm')
  async confirm(@Req() request: AppRequest, @Query() query: VerificationConfirmEmailQueryDto) {
    return this.verificationConfirmEmailAction.execute(request, query);
  }
}
