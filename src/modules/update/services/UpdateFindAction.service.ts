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
    const page: number = query.skip || 1;
    const size: number = query.limit || 10;
    const queryBuilder: FilterQuery<UpdateDocument> = {
      createdBy: context.user.id,
    };
    if (query.progress) {
      queryBuilder.progress = query.progress;
    }

    if (query.search) {
      queryBuilder.$text = { $search: query.search };
    }

    if (query.createdAt && query.condition) {
      switch (query.condition) {
        case CONDITION.ON: {
          queryBuilder.createdAt = {
            $gte: query.createdAt.startOf('day').toDate(),
            $lte: query.createdAt.endOf('day').toDate(),
          };
          break;
        }

        case CONDITION.BEFORE: {
          queryBuilder.createdAt = {
            $lt: query.createdAt.startOf('day').toDate(),
          };
          break;
        }

        case CONDITION.AFTER: {
          queryBuilder.createdAt = {
            $gt: query.createdAt.endOf('day').toDate(),
          };
          break;
        }

        default:
          break;
      }
    }

    // Conditionally populate paths on demand.
    const populatePaths: any[] = [{ path: 'createdBy', select: ['_id'] }];
    if(query.populateRecipients) {
      populatePaths.push({ path: 'recipients' })
    }

    const builder = this.updateModel
      .find(queryBuilder)
      .sort({
        createdAt: -1,
      })
      .populate(populatePaths);
    if (query.skip) {
      builder.skip((page - 1) * size);
    }

    if (query.limit) {
      builder.limit(size);
    }

    const updates = await builder;
    return updates;
  }
}
