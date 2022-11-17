/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UPDATE_PROGRESS } from '../interfaces/const';
import { LinkRedirect, LinkRedirectDocument } from '../link.redirect.schema';
import { UpdateReporting, UpdateReportingDocument } from '../update.reporting.schema';
import { UpdateSchedule, UpdateScheduleDocument } from '../update.schedule.schema';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateDeleteByIdAction {
  constructor(
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
    @InjectModel(UpdateSchedule.name) private updateScheduleModel: Model<UpdateScheduleDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    const update = await this.updateModel.findById(id).populate('recipients');
    if (!update) {
      throw new NotFoundException('Update', 'Update not found!');
    }

    if (update.progress === UPDATE_PROGRESS.DONE) {
      throw new BadRequestException(
        'Update',
        `Unfortunately the update was scheduled for ${update.datetime}, and has already gone out to the intended subscribers.`,
      );
    }

    await Promise.all([
      this.linkRedirectModel.deleteMany({
        update: update.id,
      }),
      this.updateReportingModel.deleteMany({
        update: update.id,
      }),
    ]);
    await this.updateScheduleModel.deleteOne({
      update: update.id,
    });
    await update.delete();
  }
}
