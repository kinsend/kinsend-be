import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRequest } from '../../utils/AppRequest';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { SmsStatusCallbackPayloadDto } from './dtos/SmsStatusCallbackPayloadDto';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsStatusCallbackHookAction } from './services/SmsStatusCallbackHookAction.service';

@ApiTags('Hook')
@Controller('api/hook')
export class SmsHookController
{
    constructor(private smsReceiveHookAction: SmsReceiveHookAction,
                private smsStatusCallbackHookAction: SmsStatusCallbackHookAction)
    {
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('/sms')
    receiptSmsHook(@Req() request: AppRequest,
                   @Body() payload: any)
    {
        return new Promise(async(resolve,reject) => {
            try {
                const result = await this.smsReceiveHookAction.execute(request, payload);
                resolve(result);
            } catch(error) {
                const message = 'Failed to handle received payload in receiptSmsHook !'
                reject(message);
                request.logger.error(
                    { err: error, errStack: error.stack, payload: payload },
                    message,
                );
            }
        });
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('/sms/update/status/:id')
    async statusCallbackHook(@Req() request: AppRequest,
                             @Param('id', TranformObjectIdPipe) id: string,
                             @Body() payload: any)
    {
        return new Promise(async(resolve, reject) => {
            try {
                const result = await this.smsStatusCallbackHookAction.execute(request, id, <SmsStatusCallbackPayloadDto>payload);
                resolve(result);
            } catch(error) {
                const message = 'Failed to handle received payload in statusCallbackHook!'
                reject(message);
                request.logger.error(
                    { err: error, errStack: error.stack, payload: payload },
                    message,
                );
            }
        });
    }
}
