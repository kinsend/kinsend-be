/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '../../../configs/config.service';
import { Route53Service } from '../../../shared/services/ruote53.service';
import { ConflictException } from '../../../utils/exceptions/ConflictException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { CNAME, CNAMEDocument } from '../cname.schema';
import { CNAMECreatePayload } from '../dtos/CNAMECreatePayload.dto';

@Injectable()
export class CNAMECreateAction {
  constructor(
    @InjectModel(CNAME.name) private cnameModel: Model<CNAMEDocument>,
    private userFindByIdAction: UserFindByIdAction,
    private route53Service: Route53Service,
    private readonly configService: ConfigService,
  ) {}

  async execute(context: RequestContext, payload: CNAMECreatePayload): Promise<CNAMEDocument> {
    const [isExistCNAME, user] = await Promise.all([
      this.cnameModel.findOne({
        value: payload.title,
      }),
      this.userFindByIdAction.execute(context, context.user.id),
    ]);
    if (isExistCNAME) {
      throw new ConflictException('CNAME already exist');
    }

    const response = await new this.cnameModel({ ...payload, user }).save();
    await this.route53Service.createSubDomain(
      this.configService.ruote53HostedZoneId,
      response.title,
      response.value,
    );

    return response;
  }
}
