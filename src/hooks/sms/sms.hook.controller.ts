import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRequest } from '../../utils/AppRequest';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';

@ApiTags('Hook')
@Controller('hook')
export class SmsHookController {
  constructor(private smsReceiveHookAction: SmsReceiveHookAction) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/sms')
  recieptSmsHook(@Req() request: AppRequest, @Body() payload: any) {
    return this.smsReceiveHookAction.execute(request, payload);
  }
}
