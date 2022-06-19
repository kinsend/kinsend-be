/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '../../../configs/config.service';
import { Route53Service } from '../../../shared/services/ruote53.service';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { BadRequestException } from '../../../utils/exceptions/BadRequestException';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../cname.schema';
import { CNAMEUpdatePayload } from '../dtos/CNAMEUpdatePayload.dto';

@Injectable()
export class CNAMEUpdateAction {
  constructor(
    @InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>,
    private route53Service: Route53Service,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: CNAMEUpdatePayload,
  ): Promise<CNAMEDocument> {
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Payload is not empty');
    }
    const cnameExist = await this.cnameModel.findById(id);
    if (!cnameExist) {
      throw new NotFoundException('CNAME', 'CNAME does not exist');
    }
    const { title: oldTitle, value: oldValue } = cnameExist;
    const cnameUpdated = dynamicUpdateModel<CNAMEDocument>(payload, cnameExist);
    cnameUpdated.updatedAt = new Date();

    await Promise.all([
      this.route53Service.deleteSubDomain(
        this.configService.ruote53HostedZoneId,
        oldTitle,
        oldValue,
      ),
      this.route53Service.createSubDomain(
        this.configService.ruote53HostedZoneId,
        cnameUpdated.title,
        cnameUpdated.value,
      ),
    ]);
    await cnameUpdated.save();
    return cnameUpdated;
  }
}
