/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CONDITION } from '../../segment/interfaces/const';
import { UpdateFindQueryQueryDto } from '../dtos/UpdateFindQueryDto';
import { Update, UpdateDocument } from '../update.schema';

@Injectable()
export class UpdateFindAction {
  constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>) {}

  async execute(
    context: RequestContext,
    query: UpdateFindQueryQueryDto,
  ): Promise<UpdateDocument[]> {
    const { search, progress, limit, skip, createdAt, condition } = query;
    const queryBuilder: FilterQuery<UpdateDocument> = {
      createdBy: context.user.id,
    };
    if (progress) {
      queryBuilder.progress = progress;
    }

    if (search) {
      queryBuilder.$text = { $search: search };
    }

    if (createdAt && condition) {
      switch (condition) {
        case CONDITION.ON: {
          queryBuilder.createdAt = {
            $gte: createdAt.startOf('day').toDate(),
            $lte: createdAt.endOf('day').toDate(),
          };
          break;
        }

        case CONDITION.BEFORE: {
          queryBuilder.createdAt = {
            $lt: createdAt.startOf('day').toDate(),
          };
          break;
        }

        case CONDITION.AFTER: {
          queryBuilder.createdAt = {
            $gt: createdAt.endOf('day').toDate(),
          };
          break;
        }

        default:
          break;
      }
    }
    const builder = this.updateModel
      .find(queryBuilder)
      .sort({
        createdAt: -1,
      })
      .populate([{ path: 'createdBy', select: ['_id'] }, { path: 'recipients' }]);

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
