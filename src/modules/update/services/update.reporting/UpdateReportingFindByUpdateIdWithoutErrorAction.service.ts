/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../../utils/RequestContext';

import { UpdateReporting, UpdateReportingDocument } from '../../update.reporting.schema';

@Injectable()
export class UpdateReportingFindByUpdateIdWithoutErrorAction {
  constructor(
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
  ) {}

  async execute(
    context: RequestContext,
    updateId: string,
  ): Promise<UpdateReportingDocument | null> {
    return this.updateReportingModel.findOne({
      update: updateId,
    });
  }
}
