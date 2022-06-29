/* eslint-disable consistent-return */
/* eslint-disable no-useless-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable new-cap */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { convertDateToDateObject } from '../../../utils/convertDateToDateObject';
import { DayEnum, getNextDayOfWeek, MonthNumberEnum } from '../../../utils/getDayOfNextWeek';
import { Logger } from '../../../utils/Logger';
import { RequestContext } from '../../../utils/RequestContext';
import { TagsGetByIdsAction } from '../../tags/services/TagsGetByIdsAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationCreatePayload, Delay, TaskPayload } from '../dtos/AutomationCreatePayload.dto';
import { AutomationUnsave } from '../interfaces/automation.interface';
import { DURATION, TASK_TYPE, TRIGGER_TYPE } from '../interfaces/const';
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
    const { logger } = context;
    // Validate casse tagged type
    this.checkTaggedTypePayload(payload);

    // Sanity TaggedType
    const automationUnsave: AutomationUnsave = this.sanityTaggedType(payload);

    const tasks = await this.saveTasks(logger, payload.tasks);
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

  private handleDelayDatetime(logger: Logger, delay: Delay) {
    switch (delay.duration) {
      case DURATION.UNTIL_DATE: {
        return delay;
      }
      case DURATION.TIME_FROM_TRIGGER: {
        return delay;
      }
      case DURATION.UNTIL_NEXT_DAY: {
        if (!delay.time) {
          throw new BadRequestException('time required with duration UNTIL_NEXT_DAY');
        }
        const datetime = new Date();
        datetime.setDate(datetime.getDate() + 1);
        const dateConvert = convertDateToDateObject(delay.time);
        datetime.setHours(dateConvert.hours, dateConvert.minutes);
        delay.datetime = datetime;
        return delay;
      }
      case DURATION.UNTIL_NEXT_DAY_OF_WEEK: {
        if (!delay.time || !delay.dayOfWeek) {
          throw new BadRequestException('Invalid data with duration UNTIL_NEXT_DAY_OF_WEEK');
        }
        const datetime = new Date(getNextDayOfWeek(delay.dayOfWeek as DayEnum));
        const dateConvert = convertDateToDateObject(delay.time);
        datetime.setHours(dateConvert.hours, dateConvert.minutes);
        delay.datetime = datetime;
        return delay;
      }
      case DURATION.UNTIL_NEXT_DAY_OF_MONTH: {
        if (!delay.time || !delay.dayOfMonth || !delay.month) {
          throw new BadRequestException('Invalid data with duration UNTIL_NEXT_DAY_OF_MONTH');
        }
        const datetime = new Date();
        datetime.setMonth(MonthNumberEnum.get(delay.month) || 0, delay.dayOfMonth);
        const dateConvert = convertDateToDateObject(delay.time);
        datetime.setHours(dateConvert.hours, dateConvert.minutes);
        delay.datetime = datetime;
        return delay;
      }

      default: {
        logger.warn(`${delay.duration} invalid type`);
        return;
      }
    }
  }

  private async saveTasks(logger: Logger, tasks: TaskPayload[]): Promise<TaskDocument[]> {
    const response: TaskDocument[] = [];
    for (const task of tasks) {
      if (task.type === TASK_TYPE.DELAY && task.delay) {
        task.delay = this.handleDelayDatetime(logger, task.delay);
      }
      const taskSaved = await new this.taskModel({
        ...task,
        createdAt: new Date(),
      }).save();
      response.push(taskSaved);
    }
    return response;
  }
}
