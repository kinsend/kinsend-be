import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { Automation, AutomationDocument } from '../automation.schema';
import { Task, TaskDocument } from '../task.schema';

@Injectable()
export class AutomationDeleteByIdAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    const { user } = context;
    const automation = await this.automatonModel
      .findOne({
        _id: id,
        user: user.id,
      })
      .populate([{ path: 'tasks' }]);
    if (!automation) {
      throw new NotFoundException('Automation', 'Automation not found');
    }

    const taskIds = automation.tasks.map((task) => task.id);
    await this.taskModel.deleteMany({
      _id: {
        $in: taskIds,
      },
    });
    await automation.delete();
  }
}
