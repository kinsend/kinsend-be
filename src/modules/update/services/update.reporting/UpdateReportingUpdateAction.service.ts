/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from '../../../../utils/dynamicUpdateModel';
import { NotFoundException } from '../../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../../utils/RequestContext';
import { UpdateReportingPayload } from '../../dtos/UpdateReportingPayload.dto';
import { UpdateReporting, UpdateReportingDocument } from '../../update.reporting.schema';

@Injectable()
export class UpdateReportingUpdateAction {
  constructor(
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
  ) {}

  async execute(
    context: RequestContext,
    updateId: string,
    payload: UpdateReportingPayload,
  ): Promise<UpdateReportingDocument> {
    const updateReporting = await this.updateReportingModel.findOne({
      update: updateId,
    });
    if (!updateReporting) {
      throw new NotFoundException('UpdateReporting', 'UpdateReporting not found!');
    }
    const updateReportingUpdate = dynamicUpdateModel<UpdateReportingDocument>(
      payload,
      updateReporting,
    );
    await updateReportingUpdate.save();
    return updateReportingUpdate;
  }
}
