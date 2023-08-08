import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  A2pRegistration,
  A2pRegistrationDocument,
} from 'src/modules/a2p-registration/a2p-registration.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationUpdateStatusPayload } from '../dtos/AutomationUpdateStatusPayload.dto';
import { AUTOMATION_STATUS } from '../interfaces/const';
import { AutomationGetByIdAction } from './AutomationGetByIdAction.service';

@Injectable()
export class AutomationUpdateStatusAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
    private automationGetByIdAction: AutomationGetByIdAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: AutomationUpdateStatusPayload,
  ): Promise<string> {
    const automationExist = await this.automationGetByIdAction.execute(context, id);
    // CHECKING IF USER HAS A2P REGISTRATION
    const userA2pInfo = await this.a2pRegistration.findOne({ userId: context.user.id });
    if (!userA2pInfo) return 'User registeration not found';
    if (userA2pInfo?.progress !== 'APPROVED') {
      automationExist.status = AUTOMATION_STATUS.DISABLE;
      return 'Automation is disabled because user is not registered';
    }
    automationExist.status = payload.status;
    await automationExist.save();
    return automationExist.populate([
      { path: 'tasks' },
      { path: 'taggedTags', select: ['_id'] },
      { path: 'stopTaggedTags', select: ['_id'] },
      { path: 'user', select: ['_id'] },
    ]);
  }
}
