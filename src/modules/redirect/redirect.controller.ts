import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppRequest } from '../../utils/AppRequest';
import { LinkRedirectClickedAction } from '../update/services/link.redirect/LinkRedirectClickedAction.service';
import { stringToEncodedURI } from '../../utils/stringToEncodedURI';

@ApiTags('Redirect')
@Controller('')
export class RedirectController {

  constructor(private linkRedirectClickedAction: LinkRedirectClickedAction) {}

  @Get('/:url')
  async redirect(@Req() request: AppRequest,
                 @Param('url') url: string,
                 @Res() response: Response)
  {

    let encodedRedirectUrl: string;
    try {
      const rawRedirectUrl = await this.linkRedirectClickedAction.execute(request, url);
      encodedRedirectUrl = stringToEncodedURI(rawRedirectUrl);
      if (encodedRedirectUrl === "") {
        throw new Error();
      }
    } catch (error) {
      encodedRedirectUrl='https://kinsend.io/';
      const msg = `Failed to encode redirect id '${url}'! Redirecting client to ${encodedRedirectUrl}`;
      request.logger.error({ err: error, errStack: error.stack }, msg);
    }

    return response.redirect(HttpStatus.TEMPORARY_REDIRECT, encodedRedirectUrl);

  }

}
