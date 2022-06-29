/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-return */
/* eslint-disable consistent-return */
/* eslint-disable new-cap */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { RequestContext } from '../../../utils/RequestContext';
import { TagsDeleteByIdsAction } from '../../tags/services/TagsDeleteByIdsAction.service';
import { TagsGetByIdsAction } from '../../tags/services/TagsGetByIdsAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationUpdatePayload } from '../dtos/AutomationUpdatePayload.dto';
import { AutomationUpdateUnsave } from '../interfaces/automation.interface';
import { TRIGGER_TYPE } from '../interfaces/const';
import { Task, TaskDocument } from '../task.schema';
import { AutomationGetByIdAction } from './AutomationGetByIdAction.service';

@Injectable()
export class AutomationUpdateAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private tagsGetByIdsAction: TagsGetByIdsAction,
    private automationGetAction: AutomationGetByIdAction,
    private tagsDeleteByIdsAction: TagsDeleteByIdsAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: AutomationUpdatePayload,
  ): Promise<string> {
    const automationExist = await this.automationGetAction.execute(context, id);
    this.validateTriggerType(payload);
    this.validateStopTriggerType(payload);

    const automationUnsave: AutomationUpdateUnsave = this.sanityTaggedType(
      automationExist,
      payload,
    );
    if (payload.taggedTagIds) {
      automationUnsave.taggedTags = await this.tagsGetByIdsAction.execute(
        context,
        payload.taggedTagIds,
      );
    }

    if (payload.stopTaggedTagIds) {
      automationUnsave.stopTaggedTags = await this.tagsGetByIdsAction.execute(
        context,
        payload.stopTaggedTagIds,
      );
    }

    const taskUpdate = await this.updateTasks(context, automationExist, payload);
    if (taskUpdate) {
      automationUnsave.tasks = taskUpdate;
    }

    const automationUpdate = dynamicUpdateModel<AutomationDocument>(
      automationUnsave,
      automationExist,
    );
    await automationUpdate.save();
    return automationUpdate.populate([
      { path: 'tasks' },
      { path: 'taggedTags', select: ['_id'] },
      { path: 'stopTaggedTags', select: ['_id'] },
      { path: 'user', select: ['_id'] },
    ]);
  }

  private validateStopTriggerType(payload: AutomationUpdatePayload) {
    const { stopTaggedTagIds, stopTriggerType } = payload;
    if (!stopTriggerType) {
      return;
    }
    if (
      stopTriggerType === TRIGGER_TYPE.CONTACT_TAGGED &&
      (!stopTaggedTagIds || stopTaggedTagIds.length === 0)
    ) {
      throw new BadRequestException(
        'stopTaggedTagIds is not empty when stopTriggerType is CONTACT_TAGGED',
      );
    }
    return;
  }

  private validateTriggerType(payload: AutomationUpdatePayload) {
    const { triggerType, taggedTagIds } = payload;

    if (!triggerType) {
      return;
    }

    if (
      triggerType === TRIGGER_TYPE.CONTACT_TAGGED &&
      (!taggedTagIds || taggedTagIds.length === 0)
    ) {
      throw new BadRequestException('taggedTagIds is not empty when triggerType is CONTACT_TAGGED');
    }
    return;
  }

  private sanityTaggedType(automationExist: AutomationDocument, payload: AutomationUpdatePayload) {
    const { taggedTagIds, stopTaggedTagIds, triggerType, stopTriggerType } = payload;

    if (
      taggedTagIds &&
      (automationExist.triggerType !== TRIGGER_TYPE.CONTACT_TAGGED ||
        triggerType !== TRIGGER_TYPE.CONTACT_TAGGED)
    ) {
      delete payload.taggedTagIds;
    }

    if (
      stopTaggedTagIds &&
      (automationExist.stopTriggerType !== TRIGGER_TYPE.CONTACT_CREATED ||
        stopTriggerType !== TRIGGER_TYPE.CONTACT_CREATED)
    ) {
      delete payload.stopTaggedTagIds;
    }
    return payload;
  }

  private async updateTasks(
    context: RequestContext,
    automationExist: AutomationDocument,
    payload: AutomationUpdatePayload,
  ): Promise<TaskDocument[] | undefined> {
    if (!payload.tasks || payload.tasks.length === 0) {
      return;
    }
    const oldTaskIds = automationExist.tasks.map((task) => task.id || '');
    await this.tagsDeleteByIdsAction.execute(context, oldTaskIds);
    return this.taskModel.insertMany(payload.tasks.map((task) => new this.taskModel(task)));
  }
}
