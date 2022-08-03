/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';
import { LinkRedirect, LinkRedirectDocument } from '../../link.redirect.schema';

@Injectable()
export class LinkRedirectFindIsRootdByUpdateIdAction {
  constructor(
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
  ) {}

  async execute(context: RequestContext, updateId: string): Promise<LinkRedirectDocument[]> {
    return this.linkRedirectModel
      .find({
        update: updateId,
        isRoot: true,
      })
      .populate({ path: 'clicked', select: ['-password'] });
  }
}
