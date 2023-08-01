/* eslint-disable new-cap */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  A2pRegistration,
  A2pRegistrationDocument,
} from 'src/modules/a2p-registration/a2p-registration.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { Task, TaskDocument } from '../../automation/task.schema';
import { FirstContactUpdatePayload } from '../dtos/first-contact-update-payload';
import { FirstContact, FirstContactDocument } from '../first-contact.schema';

@Injectable()
export class FistContactUpdateAction {
  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
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
      const userA2pInfo = await this.a2pRegistration.findOne({ userId: user.id });
      if (!userA2pInfo) {
        throw new HttpException('User A2P Registration not found', HttpStatus.BAD_REQUEST);
      }
      if (userA2pInfo?.progress !== 'APPROVED') {
        throw new HttpException('User is not approved', HttpStatus.BAD_REQUEST);
      }
      firstContact.isEnable = isEnable;
    }
    return (await firstContact.save()).populate(['firstTask', 'reminderTask']);
  }
}
