/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UPDATE_PROGRESS } from '../interfaces/const';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateUpdateProgressAction {
  constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>) {}

  async execute(context: RequestContext, id: string, progress: UPDATE_PROGRESS): Promise<void> {
    const update = await this.updateModel.findById(id);
    if (!update) {
      throw new NotFoundException('Update', 'Update not found!');
    }
    update.progress = progress;

    await update.save();
  }
}
