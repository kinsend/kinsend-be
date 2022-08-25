/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';
import { LinkRedirect, LinkRedirectDocument } from '../../link.redirect.schema';

@Injectable()
export class LinkRedirectFinddByUpdateIdAction {
  constructor(
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
  ) {}

  async execute(
    context: RequestContext,
    updateId: string,
    isRoot?: boolean,
  ): Promise<LinkRedirectDocument[]> {
    const queryBuilder: any = {
      update: updateId,
    };
    if (isRoot) {
      queryBuilder.isRoot = isRoot;
    }
    return this.linkRedirectModel.find(queryBuilder).populate({ path: 'clicked' });
  }
}
