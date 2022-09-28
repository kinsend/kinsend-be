import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import { SmsSentPayload } from './dtos/SmsSentPayload.dto';
import { SmsSendAction } from './services/SmsSendAction.service';

@ApiTags('Sms')
@Controller('api/sms')
export class SmsController {
  constructor(private readonly smsSendAction: SmsSendAction) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  sendSms(@Req() req: AppRequest, @Body() payload: SmsSentPayload) {
    return this.smsSendAction.execute(req, payload);
  }
}
