/* eslint-disable new-cap */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  A2pRegistration,
  A2pRegistrationDocument,
} from '@app/modules/a2p-registration/a2p-registration.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { KeywordResponseUpdatePayload } from '../dtos/keyword-response-update-payload';
import { KeywordResponseGetAction } from './keyword-response-get-action.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class KeywordResponseUpdateAction {
  constructor(
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
    private keywordResponseGetAction: KeywordResponseGetAction,
  ) {}

  async execute(context: RequestContext, payload: KeywordResponseUpdatePayload): Promise<any> {
    const { user } = context;
    const { isEnable } = payload;
    const keywordResponse = await this.keywordResponseGetAction.execute(context, false);
    if (isEnable !== undefined) {
      if (!isEnable) {
        keywordResponse.isEnable = isEnable;
        await keywordResponse.save();
        return this.keywordResponseGetAction.execute(context, true);
      }
      const userA2pInfo = await this.a2pRegistration.findOne({ userId: user.id });
      if (!userA2pInfo) {
        throw new HttpException('User A2P Registration not found', HttpStatus.BAD_REQUEST);
      }
      if (userA2pInfo?.progress !== 'APPROVED') {
        throw new HttpException('User is not approved', HttpStatus.BAD_REQUEST);
      }
      keywordResponse.isEnable = isEnable;
      await keywordResponse.save();
    }
    return this.keywordResponseGetAction.execute(context, true);
  }
}
