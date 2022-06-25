import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';

@Injectable()
export class AutomationGetAction {
  constructor(@InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>) {}

  async execute(context: RequestContext, id: string): Promise<AutomationDocument> {
    const { user } = context;
    const response = await this.automatonModel
      .findOne({
        _id: id,
        user: user.id,
      })
      .populate([
        { path: 'tasks' },
        { path: 'taggedTags', select: ['_id'] },
        { path: 'stopTaggedTags', select: ['_id'] },
        { path: 'user', select: ['_id'] },
      ]);
    if (!response) {
      throw new NotFoundException('Automation', 'Automation does not exist');
    }
    return response;
  }
}
