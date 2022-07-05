/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmplifyClientService } from '../../../shared/services/amplify.client.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';

@Injectable()
export class CNAMEDeleteByIdAction {
  constructor(
    @InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>,
    private amplifyClientService: AmplifyClientService,
  ) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    const { user } = context;
    const cnameExist = await this.cnameModel.findOne({
      user: user.id,
      id,
    });
    if (!cnameExist) {
      throw new NotFoundException('CNAME', 'CNAME not found!');
    }
    await this.amplifyClientService.deleteSubDomain(context, 'nghia-55');
    await cnameExist.delete();
  }
}
