/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';
import { TaskDocument } from '../../automation/task.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';
import { AutoKeyWordResponse } from '../auto-keyword-response.schema';
import { KeywordResponseModel } from '../model/keyword-response.model';

@Injectable()
export class KeywordResponseGetAction {
  constructor(
    @InjectModel(KeywordResponse.name)
    private keywordResponseDocument: Model<KeywordResponseDocument>,
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
