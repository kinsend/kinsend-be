/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';
import { LinkRedirect, LinkRedirectDocument } from '../../link.redirect.schema';

@Injectable()
export class LinkRedirectFindLinkClickedByCreatedByAction {
  constructor(
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
  ) {}

  async execute(
    context: RequestContext,
    createdBy: string,
    isRoot?: boolean,
  ): Promise<LinkRedirectDocument[]> {
    const queryBuilder: any = {
      createdBy,
      clicked: { $ne: [] },
    };
    if (isRoot) {
      queryBuilder.isRoot = isRoot;
    }
    return this.linkRedirectModel.find(queryBuilder).populate({ path: 'clicked' });
  }
}
