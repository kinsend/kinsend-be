import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRequest } from '../../utils/AppRequest';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { SmsStatusCallbackPayloadDto } from './dtos/SmsStatusCallbackPayloadDto';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsStatusCallbackHookAction } from './services/SmsStatusCallbackHookAction.service';

@ApiTags('Hook')
@Controller('hook')
export class SmsHookController {
  constructor(
    private smsReceiveHookAction: SmsReceiveHookAction,
    private smsStatusCallbackHookAction: SmsStatusCallbackHookAction,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/sms')
  recieptSmsHook(@Req() request: AppRequest, @Body() payload: any) {
    return this.smsReceiveHookAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/sms/update/status/:id')
  statusCallbackHook(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body() payload: SmsStatusCallbackPayloadDto,
  ) {
    return this.smsStatusCallbackHookAction.execute(request, id, payload);
  }
}
