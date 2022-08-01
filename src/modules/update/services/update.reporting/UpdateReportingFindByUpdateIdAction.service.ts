/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../../utils/RequestContext';

import { UpdateReporting, UpdateReportingDocument } from '../../update.reporting.schema';

@Injectable()
export class UpdateReportingFindByUpdateIdAction {
  constructor(
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
  ) {}

  async execute(context: RequestContext, updateId: string): Promise<UpdateReportingDocument> {
    const updateReporting = await this.updateReportingModel.findOne({
      update: updateId,
    });
    if (!updateReporting) {
      throw new NotFoundException('UpdateReporting', 'UpdateReporting not found!');
    }

    return updateReporting;
  }
}
