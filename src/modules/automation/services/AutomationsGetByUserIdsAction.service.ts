/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable unicorn/prevent-abbreviations */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';
import { TRIGGER_TYPE } from '../interfaces/const';

@Injectable()
export class AutomationsGetByUserIdsAction {
  constructor(@InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>) {}

  async execute(
    context: RequestContext,
    userId: string[],
    triggerType?: TRIGGER_TYPE,
  ): Promise<AutomationDocument[]> {
    const fillterQuery: FilterQuery<AutomationDocument> = {
      user: {
        $in: userId,
      },
    };
    if (triggerType) {
      fillterQuery.triggerType = triggerType;
    }
    return this.automatonModel
      .find(fillterQuery)
      .populate([
        { path: 'tasks' },
        { path: 'taggedTags', select: ['_id'] },
        { path: 'stopTaggedTags', select: ['_id'] },
        { path: 'user', select: ['_id'] },
      ]);
  }
}
