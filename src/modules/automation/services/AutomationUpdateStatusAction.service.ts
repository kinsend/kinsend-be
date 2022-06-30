import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationUpdateStatusPayload } from '../dtos/AutomationUpdateStatusPayload.dto';
import { AutomationGetByIdAction } from './AutomationGetByIdAction.service';

@Injectable()
export class AutomationUpdateStatusAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    private automationGetByIdAction: AutomationGetByIdAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: AutomationUpdateStatusPayload,
  ): Promise<string> {
    const automationExist = await this.automationGetByIdAction.execute(context, id);
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
