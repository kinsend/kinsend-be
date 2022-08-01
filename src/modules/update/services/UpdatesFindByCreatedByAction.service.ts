/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdatesFindByCreatedByAction {
  constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>) {}

  async execute(context: RequestContext, createdById: string): Promise<UpdateDocument[]> {
    return this.updateModel.find({
      createdBy: createdById,
    });
  }
}
