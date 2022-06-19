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
    const { user } = context;
    // Check user already has a cname
    const cnameByUser = await this.cnameModel.findOne({
      user: user.id,
    });
    if (cnameByUser) {
      throw new ConflictException('User already has a name!');
    }
    // Check cname exist
    const [isExistCNAME, userExist] = await Promise.all([
      this.cnameModel.findOne({
        value: payload.title,
      }),
      this.userFindByIdAction.execute(context, user.id),
    ]);
    if (isExistCNAME) {
      throw new ConflictException('CNAME already exist');
    }

    const response = await new this.cnameModel({ ...payload, user: userExist }).save();
    await this.route53Service.createSubDomain(
      context,
      this.configService.ruote53HostedZoneId,
      response.title,
      response.value,
    );

    return response;
  }
}
