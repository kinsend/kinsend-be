/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { RequestContext } from '../../../utils/RequestContext';
import { sleep } from '../../../utils/sleep';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationCreatePayload } from '../dtos/AutomationCreatePayload.dto';
import { Task, TaskDocument } from '../task.schema';

@Injectable()
export class AutomationCreateAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private imageUploadAction: ImageUploadAction,
    private backgroudJobService: BackgroudJobService,
  ) {}

  async execute(
    context: RequestContext,
    payload: AutomationCreatePayload,
  ): Promise<AutomationDocument> {
    const user = await this.userModel.findById(context.user.id);
    const tasks = await this.taskModel.insertMany(
      payload.tasks.map((task) => new this.taskModel({ message: task.message, delay: task.delay })),
    );

    // TODO: find subscriber by type trigger
    const automation = await new this.automatonModel({
      ...payload,
      tasks,
      subscribers: [user],
    }).save();

    // Add backgroud job for schedule trigger action
    const automationRelationShip = await (
      await automation.populate({ path: 'tasks' })
    ).populate({
      path: 'subscribers',
      select: ['_id', 'email', 'firstName', 'lastName', 'phoneNumber'],
    });
    const startDate = new Date(Date.now() + 2000);
    this.backgroudJobService.job(startDate, undefined, this.excuteTasks(automationRelationShip));
    return automation;
  }

  private excuteTasks(automation: AutomationDocument): any {
    return () => {
      automation.tasks.map(async (task) => {
        if (task.delay) {
          const milisecond = new Date(task.delay.datetime).getTime() - Date.now();
          await sleep(milisecond);
        }
        console.log('Starting......');
        // TODO: send sms to subscriber
        // TODO: check Stop trigger for filter subscriber
      });
    };
  }
}
