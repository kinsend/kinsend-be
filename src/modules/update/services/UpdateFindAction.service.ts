/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { UpdateFindQueryQueryDto } from '../dtos/UpdateFindQueryDto';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateFindAction {
  constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>) {}

  async execute(
    context: RequestContext,
    query: UpdateFindQueryQueryDto,
  ): Promise<UpdateDocument[]> {
    const { search, progress, limit, skip } = query;
    const condition: FilterQuery<UpdateDocument> = {
      createdBy: context.user.id,
    };
    if (progress) {
      condition.progress = progress;
    }

    if (search) {
      condition.$text = { $search: search };
    }

    const builder = this.updateModel
      .find(condition)
      .sort({
        createdAt: -1,
      })
      .populate([{ path: 'createdBy', select: ['_id'] }]);

    if (skip) {
      builder.skip(skip);
    }

    if (limit) {
      builder.limit(limit);
    }

    const updates = await builder;
    return updates;
  }
}
