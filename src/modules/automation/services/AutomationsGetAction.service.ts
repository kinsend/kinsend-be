import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';

@Injectable()
export class AutomationsGetAction {
  constructor(@InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>) {}

  async execute(context: RequestContext): Promise<AutomationDocument[]> {
    const { user } = context;
    return this.automatonModel
      .find({
        user: user.id,
      })
      .populate([
        { path: 'tasks' },
        { path: 'taggedTags', select: ['_id'] },
        { path: 'stopTaggedTags', select: ['_id'] },
        { path: 'user', select: ['_id'] },
      ]);
  }
}
