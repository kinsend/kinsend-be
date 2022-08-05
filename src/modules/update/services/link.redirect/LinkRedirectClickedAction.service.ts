/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';
import { LinkRedirect, LinkRedirectDocument } from '../../link.redirect.schema';

@Injectable()
export class LinkRedirectClickedAction {
  constructor(
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
  ) {}

  async execute(context: RequestContext, url: string): Promise<string> {
    const linkRedirect = await this.linkRedirectModel.findOne({
      url,
    });
    if (!linkRedirect) {
      throw new NotFoundException('No match url');
    }
    // async
    this.hanldeUpdateReporting(context, linkRedirect);

    return linkRedirect.redirect;
  }

  private async hanldeUpdateReporting(context: RequestContext, linkRedirect: LinkRedirectDocument) {
    const rootLinkRedirect = await this.linkRedirectModel.findOne({
      redirect: linkRedirect.redirect,
      update: linkRedirect.update,
      isRoot: true,
    });

    await linkRedirect.populate([{ path: 'update' }, { path: 'clicked' }]);

    const { clicked, isClicked } = linkRedirect;
    if (!isClicked && rootLinkRedirect) {
      await Promise.all([
        rootLinkRedirect.updateOne({
          clicked: [...(rootLinkRedirect.clicked || []), ...(clicked || [])],
        }),
        linkRedirect.updateOne({
          isClicked: true,
        }),
      ]);
    }
  }
}
