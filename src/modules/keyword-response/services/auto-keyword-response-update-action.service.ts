/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/modules/automation/task.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { AutoKeywordResponseCreatePayload } from '../dtos/auto-keyword-response-create-payload';
import { KeywordResponseGetAction } from './keyword-response-get-action.service';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';
import { AutoKeywordResponseGetLatestIndexAction } from './auto-keyword-response-get-latest-index-action.service';
import { AutoKeywordResponseUpdatePayload } from '../dtos/auto-keyword-response-update-payload';

@Injectable()
export class AutoKeywordResponseUpdateAction {
  constructor(
    private keywordResponseGetAction: KeywordResponseGetAction,
    @InjectModel(AutoKeyWordResponse.name)
    private autoKeyWordResponseDocument: Model<AutoKeyWordResponseDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private autoKeywordResponseGetLatestIndexAction: AutoKeywordResponseGetLatestIndexAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: AutoKeywordResponseUpdatePayload,
  ): Promise<any> {
    const { user } = context;
    const { response, tagId, pattern, index } = payload;
    const auto = await this.autoKeyWordResponseDocument.findById(id);
    if (!auto) {
      throw new NotFoundException('Not found!');
    }
    let task: any = auto.response;
    if (response) {
      task = await new this.taskModel(response).save();
      await this.taskModel.deleteOne({
        id: auto.response._id,
      });
    }
    auto.response = task;
    if (tagId) {
      auto.tag = new mongoose.Types.ObjectId(tagId) as any;
    }
    if (pattern) {
      auto.pattern = pattern;
    }
    if (index) {
      const { keywordResponse, type } = auto;
      const currentAutoRes = await this.autoKeyWordResponseDocument.findOne({
        keywordResponse,
        index: index,
        type,
      });
      if (currentAutoRes) {
        currentAutoRes.index = auto.index;
        await currentAutoRes.save();
      }
      auto.index = index;
    }
    return (await auto.save()).populate(['response', 'tag']);
  }
}
