/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { UPDATE_PROGRESS } from '../interfaces/const';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdatesGetCountByCreatedByAction {
  constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>) {}

  async execute(createdById: string): Promise<number> {
    return this.updateModel.count({
      createdBy: createdById,
      progress: UPDATE_PROGRESS.DONE,
    });
  }
}
