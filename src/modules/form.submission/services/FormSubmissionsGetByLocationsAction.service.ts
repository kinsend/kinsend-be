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

  async execute(context: RequestContext, location: string): Promise<FormSubmissionDocument[]> {
    const response = await this.formSubmissionModel.find({
      owner: context.user.id,
      location: { $regex: `${location}$`, $options: 'i' },
    });
    return response;
  }
}
