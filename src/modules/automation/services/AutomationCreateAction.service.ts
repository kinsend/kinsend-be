/* eslint-disable unicorn/no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable new-cap */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { TagsGetByIdsAction } from '../../tags/services/TagsGetByIdsAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationCreatePayload } from '../dtos/AutomationCreatePayload.dto';
import { AutomationUnsave } from '../interfaces/automation.interface';
import { TRIGGER_TYPE } from '../interfaces/const';
import { Task, TaskDocument } from '../task.schema';

@Injectable()
export class AutomationCreateAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private tagsGetByIdsAction: TagsGetByIdsAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: AutomationCreatePayload,
  ): Promise<AutomationDocument> {
    this.checkTaggedTypePayload(payload);
    const automationUnsave: AutomationUnsave = this.sanityTaggedType(payload);
    const tasks = await this.taskModel.insertMany(
      payload.tasks.map((task) => new this.taskModel(task)),
    );

    if (payload.triggerType === TRIGGER_TYPE.CONTACT_TAGGED && payload.taggedTagIds) {
      automationUnsave.taggedTags = await this.tagsGetByIdsAction.execute(
        context,
        payload.taggedTagIds,
      );
    }
    if (payload.stopTriggerType === TRIGGER_TYPE.CONTACT_TAGGED && payload.stopTaggedTagIds) {
      automationUnsave.stopTaggedTags = await this.tagsGetByIdsAction.execute(
        context,
        payload.stopTaggedTagIds,
      );
    }
    const { user } = context;
    const userModel = new this.userModel({ ...user, _id: new mongoose.Types.ObjectId(user.id) });
    const automation = await new this.automatonModel({
      ...automationUnsave,
      tasks,
      user: userModel,
    }).save();
    return automation.populate([
      { path: 'tasks' },
      { path: 'taggedTags', select: ['_id'] },
      { path: 'stopTaggedTags', select: ['_id'] },
      { path: 'user', select: ['_id'] },
    ]);
  }
  private checkTaggedTypePayload(payload: AutomationCreatePayload) {
    if (payload.triggerType === TRIGGER_TYPE.CONTACT_TAGGED) {
      if (!payload.taggedTagIds || payload.taggedTagIds.length === 0) {
        throw new BadRequestException(
          'taggedTagIds is not empty when triggerType is CONTACT_TAGGED',
        );
      }
    }

    if (payload.stopTriggerType === TRIGGER_TYPE.CONTACT_TAGGED) {
      if (!payload.stopTaggedTagIds || payload.stopTaggedTagIds.length === 0) {
        throw new BadRequestException(
          'stopTaggedTagIds is not empty when stopTriggerType is CONTACT_TAGGED',
        );
      }
    }
  }
  private sanityTaggedType(payload: AutomationCreatePayload) {
    if (payload.triggerType !== TRIGGER_TYPE.CONTACT_TAGGED && payload.taggedTagIds) {
      delete payload.taggedTagIds;
    }
    if (payload.stopTriggerType !== TRIGGER_TYPE.CONTACT_TAGGED && payload.stopTaggedTagIds) {
      delete payload.stopTaggedTagIds;
    }
    return payload;
  }

  // TODO: update later
  // private excuteTasks(automation: AutomationDocument): any {
  //   return () => {
  //     automation.tasks.map(async (task) => {
  //       if (task.delay) {
  //         const milisecond = new Date(task.delay.datetime).getTime() - Date.now();
  //         await sleep(milisecond);
  //       }
  //       console.log('Starting......');
  //       // TODO: send sms to subscriber
  //       // TODO: check Stop trigger for filter subscriber
  //     });
  //   };
  // }
}
