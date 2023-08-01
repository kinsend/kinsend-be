/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  A2pRegistration,
  A2pRegistrationDocument,
} from 'src/modules/a2p-registration/a2p-registration.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { AutoKeyWordResponse } from '../auto-keyword-response.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';
import { KeywordResponseModel } from '../model/keyword-response.model';

@Injectable()
export class KeywordResponseGetAction {
  constructor(
    @InjectModel(KeywordResponse.name)
    private keywordResponseDocument: Model<KeywordResponseDocument>,
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
  ) {}

  async execute(context: RequestContext, isBuildModel = true): Promise<any> {
    const { user } = context;
    let keywordResponseDocument = await this.keywordResponseDocument.findOne({
      createdBy: user.id,
    });
    if (!keywordResponseDocument) {
      keywordResponseDocument = await new this.keywordResponseDocument({
        createdBy: user.id,
      }).save();
    }
    const userA2pInfo = await this.a2pRegistration.findOne({ userId: user.id });
    if (!userA2pInfo || userA2pInfo?.progress !== 'APPROVED') {
      keywordResponseDocument.isEnable = false;
      await keywordResponseDocument.save();
    }
    const response = await keywordResponseDocument.populate({
      path: 'autoKeywordResponses',
      populate: {
        path: 'response',
      },
    });
    if (!isBuildModel) {
      return keywordResponseDocument as KeywordResponseModel;
    }
    return this.buildKeywordResponse(response);
  }

  private async buildKeywordResponse(
    keywordResponse: KeywordResponseDocument,
  ): Promise<KeywordResponseModel> {
    const hashtagAndEmoji: AutoKeyWordResponse[] = [];
    const regex: AutoKeyWordResponse[] = [];
    if (!keywordResponse.autoKeywordResponses) {
      return keywordResponse as KeywordResponseModel;
    }
    for (const autoKeywordResponse of keywordResponse.autoKeywordResponses) {
      await autoKeywordResponse.populate('tag');
      if (autoKeywordResponse.type === AUTO_KEYWORD_RESPONSE_TYPE.HASHTAG_OR_EMOJI) {
        hashtagAndEmoji.push(autoKeywordResponse);
      } else {
        regex.push(autoKeywordResponse);
      }
    }
    hashtagAndEmoji.sort((a, b) => a.index - b.index);
    regex.sort((a, b) => a.index - b.index);
    keywordResponse.$set('hashtagAndEmoji', hashtagAndEmoji, { strict: false });
    keywordResponse.$set('regex', regex, { strict: false });
    keywordResponse.$set('autoKeywordResponses', null, { strict: false });
    return keywordResponse as KeywordResponseModel;
  }
}
