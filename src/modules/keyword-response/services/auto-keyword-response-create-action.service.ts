/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/modules/automation/task.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { AutoKeywordResponseCreatePayload } from '../dtos/auto-keyword-response-create-payload';
import { KeywordResponseGetAction } from './keyword-response-get-action.service';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';
import { AutoKeywordResponseGetLatestIndexAction } from './auto-keyword-response-get-latest-index-action.service';

@Injectable()
export class AutoKeywordResponseCreateAction {
  constructor(
    private keywordResponseGetAction: KeywordResponseGetAction,
    @InjectModel(AutoKeyWordResponse.name)
    private autoKeyWordResponseDocument: Model<AutoKeyWordResponseDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private autoKeywordResponseGetLatestIndexAction: AutoKeywordResponseGetLatestIndexAction,
  ) {}

  async execute(context: RequestContext, payload: AutoKeywordResponseCreatePayload): Promise<any> {
    const { user } = context;
    const { response, tagId, pattern, type } = payload;
    const keywordResponse = await this.keywordResponseGetAction.execute(context, false);
    const autoKeywordResponseLatest = await this.autoKeywordResponseGetLatestIndexAction.execute(
      context,
      keywordResponse._id,
      type,
    );
    let task: any = null;
    if (response) {
      task = await new this.taskModel(response).save();
    }
    const autoKeywordResponse = await new this.autoKeyWordResponseDocument({
      tag: new mongoose.Types.ObjectId(tagId),
      response: task._id,
      pattern,
      type,
      createdBy: user.id,
      keywordResponse: keywordResponse._id,
      index: (autoKeywordResponseLatest?.index || 0) + 1,
    }).save();
    keywordResponse.autoKeywordResponses?.push(autoKeywordResponse);
    await keywordResponse.save();
    return autoKeywordResponse.populate('response');
  }
}
