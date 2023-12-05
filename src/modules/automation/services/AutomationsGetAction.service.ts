import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  A2pRegistration,
  A2pRegistrationDocument,
} from '@app/modules/a2p-registration/a2p-registration.schema';
import { RequestContext } from '@app/utils/RequestContext';
import { Automation, AutomationDocument } from '@app/modules/automation/automation.schema';
import { AUTOMATION_STATUS } from '../interfaces/const';

@Injectable()
export class AutomationsGetAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
  ) {}

  async execute(context: RequestContext, userId?: string): Promise<AutomationDocument[]> {
    const { user } = context;
    const automations = await this.automatonModel
      .find({
        user: userId || user.id,
      })
      .populate([
        { path: 'tasks' },
        { path: 'taggedTags', select: ['_id'] },
        { path: 'stopTaggedTags', select: ['_id'] },
        { path: 'user', select: ['_id'] },
      ]);

    const userA2pRegistration = await this.a2pRegistration.findOne({
      userId: userId || user.id,
    });

    if (!userA2pRegistration || userA2pRegistration.progress !== 'APPROVED') {
      await Promise.all(
        automations.map(async (automation) => {
          automation.status = AUTOMATION_STATUS.DISABLE;
          await automation.save();
        }),
      );
    }

    return automations;
  }
}
