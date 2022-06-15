/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';
import { CNAMEUpdatePayload } from '../dtos/CNAMEUpdatePayload.dto';

@Injectable()
export class CNAMEUpdateAction {
  constructor(@InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: CNAMEUpdatePayload,
  ): Promise<CNAMEDocument> {
    const cnameExist = await this.cnameModel.findById(id);
    if (!cnameExist) {
      throw new NotFoundException('CNAME', 'CNAME does not exist');
    }
    const cnameUpdated = dynamicUpdateModel<CNAMEDocument>(payload, cnameExist);
    cnameUpdated.updatedAt = new Date();
    await cnameUpdated.save();
    return cnameUpdated;
  }
}
