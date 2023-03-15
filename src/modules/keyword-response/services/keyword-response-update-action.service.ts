/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { KeywordResponseGetAction } from './keyword-response-get-action.service';
import { KeywordResponseUpdatePayload } from '../dtos/keyword-response-update-payload';

@Injectable()
export class KeywordResponseUpdateAction {
  constructor(private keywordResponseGetAction: KeywordResponseGetAction) {}

  async execute(context: RequestContext, payload: KeywordResponseUpdatePayload): Promise<any> {
    const { user } = context;
    const { isEnable } = payload;
    const keywordResponse = await this.keywordResponseGetAction.execute(context, false);
    if (isEnable !== undefined) {
      keywordResponse.isEnable = isEnable;
      await keywordResponse.save();
    }
    return this.keywordResponseGetAction.execute(context, true);
  }
}
