/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';

@Injectable()
export class CNAMEGetsAction {
  constructor(@InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>) {}

  async execute(context: RequestContext): Promise<CNAMEDocument[]> {
    const { user } = context;
    return this.cnameModel
      .find({
        user: user.id,
      })
      .select(['-domain', '-value']);
  }
}
