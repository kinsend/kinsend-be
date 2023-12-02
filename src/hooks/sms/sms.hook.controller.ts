import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AppRequest } from '@app/utils/AppRequest';
import { TranformObjectIdPipe } from '@app/utils/ParseBigIntPipe';
import { SmsStatusCallbackPayloadDto } from './dtos/SmsStatusCallbackPayloadDto';
import { SmsReceiveHookAction } from './services/SmsReceiveHookAction.service';
import { SmsStatusCallbackHookAction } from './services/SmsStatusCallbackHookAction.service';

export const CONTROLLER_BASE = "/api/hook"
export const CONTROLLER_HOOK_STATUS_CALLBACK = "/sms/update/status/:id"
export const CONTROLLER_HOOK_SMS = "/sms"

@ApiTags('Hook')
@Controller('api/hook')
export class SmsHookController
{
    constructor(private smsReceiveHookAction: SmsReceiveHookAction,
                private smsStatusCallbackHookAction: SmsStatusCallbackHookAction)
    {
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(CONTROLLER_HOOK_SMS)
    async receiptSmsHook(@Req() request: AppRequest,
                         @Body() payload: any,
                         @Res() response: Response)
    {
        return new Promise<void>(async(resolve,reject) => {
            try {
                await this.smsReceiveHookAction.execute(request, payload);
                response.status(HttpStatus.OK);
                response.send();
                resolve();
            } catch(error) {
                const message = 'Failed to handle received payload in receiptSmsHook !'
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                response.send();
                reject(message);
                request.logger.error(
                    { err: error, errStack: error.stack, payload: payload },
                    message,
                );
            }
        });
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(CONTROLLER_HOOK_STATUS_CALLBACK)
    async statusCallbackHook(@Req() request: AppRequest,
                             @Param('id', TranformObjectIdPipe) id: string,
                             @Body() payload: any,
                             @Res() response: Response)
    {
        return new Promise<void>(async(resolve, reject) => {
            try {
                await this.smsStatusCallbackHookAction.execute(request, id, <SmsStatusCallbackPayloadDto>payload);
                response.status(HttpStatus.OK);
                response.send();
                resolve();
            } catch(error) {
                const message = 'Failed to handle received payload in statusCallbackHook!'
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                response.send();
                reject(message);
                request.logger.error(
                    { err: error, errStack: error.stack, payload: payload },
                    message,
                );
            }
        });
    }
}
