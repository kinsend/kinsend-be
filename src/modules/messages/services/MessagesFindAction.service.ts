/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import e from 'express';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { filterDuplicateArray } from '../../../utils/filterDuplicateArray';
import { findDuplicateArray } from '../../../utils/findDuplicateArray';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { FormSubmissionFindByFiltersContactAction } from '../../form.submission/services/FormSubmissionFindByFiltersContactAction.service';
import { FormSubmissionsFindByTadIdsAction } from '../../form.submission/services/FormSubmissionsFindByTadIdsAction.service';
import { Filter } from '../../segment/dtos/SegmentCreatePayload.dto';
import { SegmentFindByIdAction } from '../../segment/services/SegmentFindByIdAction.service';
import { UpdateFindByIdWithoutReportingAction } from '../../update/services/UpdateFindByIdWithoutReportingAction.service';
import { MessageFindDto, MessageFindQueryQueryDto } from '../dtos/MessageFindQueryDto';
import { Message, MessageDocument } from '../message.schema';
@Injectable()
export class MessagesFindAction {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private formSubmissionFindByFiltersContactAction: FormSubmissionFindByFiltersContactAction,
    private formSubmissionsFindByTadIdsAction: FormSubmissionsFindByTadIdsAction,
    private updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    private segmentFindByIdAction: SegmentFindByIdAction,
  ) {}
  async execute(
    context: RequestContext,
    query: MessageFindQueryQueryDto,
    payload: MessageFindDto,
  ): Promise<any[]> {
    const { search } = query;
    const { user } = context;
    const userId = new mongoose.Types.ObjectId(user.id);
    const match: any = { user: userId as any };
    if (search) {
      match.$text = { $search: search };
    }
    const { filters } = payload;
    let subIds: any[] = [];
    if (filters && filters.length !== 0) {
      const subs = await this.handleFindByFilters(context, filters);
      subIds = subs.map((sub) => new mongoose.Types.ObjectId(sub.id));
      match.formSubmission = { $in: subIds };
    }
    const listMessages = await this.messageModel.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: '$formSubmission',
          message: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $sort: { 'message.dateSent': -1 },
      },
      {
        $replaceWith: {
          $setField: {
            field: 'message',
            input: '$$ROOT',
            value: { $last: '$message' },
          },
        },
      },
      {
        $lookup: {
          from: 'formsubmissions',
          localField: 'message.formSubmission',
          foreignField: '_id',
          as: 'formSubmission',
        },
      },
      {
        $set: {
          'formSubmission.message': '$message',
        },
      },
      {
        $unwind: '$formSubmission',
      },
      {
        $match: {
          $and: [
            { 'formSubmission.isContactHidden': false } as any,
            { 'formSubmission.isContactArchived': false } as any,
          ],
        },
      },
      {
        $replaceRoot: {
          newRoot: '$formSubmission',
        },
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
        },
      },
      {
        $unset: ['message.formSubmission', 'message._id', 'message.user', '_id', 'owner', 'form'],
      },
    ]);
    return listMessages;
  }

  private async handleFindByFilters(
    context: RequestContext,
    filters: Filter[][],
  ): Promise<FormSubmissionDocument[]> {
    const subscribersResult: FormSubmissionDocument[] = [];
    for (const filter of filters) {
      const subscribers: FormSubmissionDocument[] = [];
      for (const filterItem of filter) {
        if (filterItem.tagId) {
          const subs = await this.formSubmissionsFindByTadIdsAction.execute(
            context,
            filterItem.tagId,
          );
          subscribers.push(...subs);
          continue;
        }
        if (filterItem.updateId) {
          const subs = await this.updateFindByIdWithoutReportingAction.execute(
            context,
            filterItem.updateId,
          );
          subscribers.push(...(subs.recipients as FormSubmissionDocument[]));
          continue;
        }
        if (filterItem.segmentId) {
          const segment = await this.segmentFindByIdAction.execute(context, filterItem.segmentId);
          const subs = await this.handleFindByFilters(context, segment.filters);
          subscribers.push(...subs);
          continue;
        }
        const subs = await this.formSubmissionFindByFiltersContactAction.execute(
          context,
          context.user.id,
          filterItem,
        );
        subscribers.push(...subs);
      }
      // And condition will filter items appear in cases
      if (filter.length > 1) {
        const data = findDuplicateArray(subscribers);
        subscribersResult.push(...data);
        continue;
      }
      subscribersResult.push(...subscribers);

      // Filters
    }
    // Or should merge all items
    return filterDuplicateArray(subscribersResult);
  }
}
