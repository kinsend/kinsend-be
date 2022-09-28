/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { CNAME, CNAMEDocument } from '../cname.schema';

@Injectable()
export class CNAMEGetByTitleAction {
  constructor(@InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>) {}

  async execute(title: string): Promise<CNAMEDocument> {
    const cname = await this.cnameModel.findOne({
      title,
    });
    if (!cname) {
      throw new NotFoundException('CNAME', 'CNAME does not exist');
    }
    return cname;
  }
}
