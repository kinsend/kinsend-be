import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppRequest } from '../../utils/AppRequest';
import { LinkRedirectClickedAction } from '../update/services/link.redirect/LinkRedirectClickedAction.service';

@ApiTags('Redirect')
@Controller('')
export class RedirectController {
  constructor(private linkRedirectClickedAction: LinkRedirectClickedAction) {}

  @Get('/:url')
  async redirect(@Req() request: AppRequest, @Param('url') url: string, @Res() response: Response) {
    const redirectUrl = await this.linkRedirectClickedAction.execute(request, url);
    return response.redirect(redirectUrl);
  }
}
