import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { Automation, AutomationDocument } from '../automation.schema';

@Injectable()
export class AutomationGetByTagIdsAction {
  constructor(@InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>) {}

  async execute(userId: string, tagIds: string[]): Promise<AutomationDocument[]> {
    const response = await this.automatonModel
      .find({
        user: userId,
        taggedTags: {
          $elemMatch: {
            $in: tagIds,
          },
        },
      })
      .populate([
        { path: 'tasks' },
        { path: 'taggedTags', select: ['_id'] },
        { path: 'stopTaggedTags', select: ['_id'] },
        { path: 'user', select: ['_id'] },
      ]);
    if (!response) {
      throw new NotFoundException('Automation', 'Automation not found');
    }
    return response;
  }
}
