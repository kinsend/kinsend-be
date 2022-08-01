/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionsGetByLocationsAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, locations: string[]): Promise<FormSubmissionDocument[]> {
    const response = await this.formSubmissionModel.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(context.user.id) as any,
          location: { $in: locations as any },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            phoneNumber: '$phoneNumber',
            email: '$email',
            firstName: '$firstName',
            lastName: '$lastName',
            location: '$location',
          },
        },
      },
      { $replaceWith: '$_id' as any },
    ]);
    return response;
  }
}
