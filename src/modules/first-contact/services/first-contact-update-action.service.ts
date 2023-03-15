/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FirstContact, FirstContactDocument } from '../first-contact.schema';
import { FirstContactUpdatePayload } from '../dtos/first-contact-update-payload';
import { Task, TaskDocument } from '../../automation/task.schema';

@Injectable()
export class FistContactUpdateAction {
  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: FirstContactUpdatePayload,
  ): Promise<FirstContact> {
    const { user } = context;
    let firstContact = await this.firstContactDocument.findOne({
      createdBy: user.id,
    });
    // Create
    const { isEnable, firstTask, reminderTask } = payload;
    if (!firstContact) {
      firstContact = await new this.firstContactDocument({
        createdBy: user.id,
      }).save();
    }

    const { firstTask: firstTaskCurrent, reminderTask: reminderTaskCurrent } =
      await firstContact.populate(['firstTask', 'reminderTask']);
    if (firstTask) {
      if (!firstTaskCurrent) {
        const firstTaskCreated = await new this.taskModel(firstTask).save();
        firstContact.firstTask = firstTaskCreated;
      } else {
        const { message, fileAttached } = firstTask;
        firstTaskCurrent.message = message ? message : firstTaskCurrent.message;
        firstTaskCurrent.fileAttached = fileAttached ? fileAttached : firstTaskCurrent.fileAttached;
        await firstTaskCurrent.save();
      }
    }
    if (reminderTask) {
      if (!reminderTaskCurrent) {
        const reminderTaskCreated = await new this.taskModel(reminderTask).save();
        firstContact.reminderTask = reminderTaskCreated;
      } else {
        const { message, fileAttached } = reminderTask;
        reminderTaskCurrent.message = message ? message : reminderTaskCurrent.message;
        reminderTaskCurrent.fileAttached = fileAttached
          ? fileAttached
          : reminderTaskCurrent.fileAttached;
        await reminderTaskCurrent.save();
      }
    }
    if (isEnable !== undefined) {
      firstContact.isEnable = isEnable;
    }
    return (await firstContact.save()).populate(['firstTask', 'reminderTask']);
  }
}
