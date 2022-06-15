/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';

@Injectable()
export class CNAMEGetByUserIdAction {
  constructor(@InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>) {}

  async execute(context: RequestContext, userId: string): Promise<CNAMEDocument | null> {
    return this.cnameModel.findOne({
      user: userId,
    });
  }
}
