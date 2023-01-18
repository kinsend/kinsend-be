/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';

@Injectable()
export class AutoKeywordResponseGetLatestIndexAction {
  constructor(
    @InjectModel(AutoKeyWordResponse.name)
    private autoKeyWordResponseDocument: Model<AutoKeyWordResponseDocument>,
  ) {}

  async execute(
    context: RequestContext,
    keywordResponseId: string,
    type: string,
  ): Promise<AutoKeyWordResponseDocument> {
    const response = await this.autoKeyWordResponseDocument
      .findOne({
        keywordResponse: keywordResponseId,
        type,
      })
      .sort({
        index: -1,
      });
    return response as AutoKeyWordResponseDocument;
  }
}
