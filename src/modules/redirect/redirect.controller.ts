import { Controller, Get, Param, Req, Res } from '@nestjs/common';
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

    const rawRedirectUrl = await this.linkRedirectClickedAction.execute(request, url);

    let encodedRedirectUrl: string;
    try {
      encodedRedirectUrl = stringToEncodedURI(rawRedirectUrl);
      if (encodedRedirectUrl === "") {
        throw new Error();
      }
    } catch (error) {
      encodedRedirectUrl='https://kinsend.io/';
      const msg = `Failed to encode redirect id '${url}' (${rawRedirectUrl})! Redirecting client to ${encodedRedirectUrl}`;
      request.logger.error({ err: error, errStack: error.stack }, msg);
    }

    return response.redirect(encodedRedirectUrl);

  }

}
