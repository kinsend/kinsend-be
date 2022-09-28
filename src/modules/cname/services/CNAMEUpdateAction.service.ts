/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmplifyClientService } from '../../../shared/services/amplify.client.service';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { BadRequestException } from '../../../utils/exceptions/BadRequestException';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';
import { CNAMEUpdatePayload } from '../dtos/CNAMEUpdatePayload.dto';
import { CNAMEGetByTitleAction } from './CNAMEGetByTitleAction.service';

@Injectable()
export class CNAMEUpdateAction {
  constructor(
    @InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>,
    private amplifyClientService: AmplifyClientService,
    private cnameGetByTitleAction: CNAMEGetByTitleAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string | undefined,
    title: string | undefined,
    payload: CNAMEUpdatePayload,
  ): Promise<CNAMEDocument> {
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Payload is not empty');
    }
    let cnameExist;
    if (id) {
      cnameExist = await this.cnameModel.findById(id);
    }
    if (title) {
      cnameExist = await this.cnameGetByTitleAction.execute(title);
    }
    if (!cnameExist) {
      throw new NotFoundException('CNAME', 'CNAME does not exist');
    }
    const { title: oldTitle } = cnameExist;
    const cnameUpdated = dynamicUpdateModel<CNAMEDocument>(payload, cnameExist);
    cnameUpdated.updatedAt = new Date();

    await this.amplifyClientService.replaceSubDomain(context, oldTitle, cnameUpdated.title);
    await cnameUpdated.save();
    return cnameUpdated.populate({ path: 'user', select: ['-password'] });
  }
}
