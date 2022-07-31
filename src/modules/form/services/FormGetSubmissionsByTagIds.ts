/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ngoose, { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission } from '../../form.submission/form.submission.schema';

@Injectable()
export class FormGetSubmissionsByTagIds {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async execute(context: RequestContext, tagIds: string[]): Promise<FormSubmission[]> {
    const tagObjectIds = tagIds.map((tagId) => new ngoose.Types.ObjectId(tagId));

    const response = await this.formModel.aggregate([
      {
        $match: {
          tags: { $in: tagObjectIds as any },
        },
      },
      {
        $lookup: {
          from: 'formsubmissions',
          localField: 'form',
          foreignField: 'forms',
          as: 'formsubmissions',
        },
      },
      {
        $unwind: '$formsubmissions',
      },
      {
        $group: {
          _id: {
            phoneNumber: '$formsubmissions.phoneNumber',
            email: '$formsubmissions.email',
            firstName: '$formsubmissions.firstName',
            lastName: '$formsubmissions.lastName',
            location: '$formsubmissions.location',
          },
        },
      },
      { $replaceWith: '$_id' as any },
    ]);
    return response;
  }
}
