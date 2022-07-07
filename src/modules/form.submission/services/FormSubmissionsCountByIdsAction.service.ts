/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionsCountResponse } from '../interfaces/form.submission.interface';

@Injectable()
export class FormSubmissionsCountByIdsAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(ids: mongoose.Types.ObjectId[]): Promise<FormSubmissionsCountResponse[]> {
    const response = await this.formSubmissionModel
      .aggregate()
      .match({ form: { $in: ids as any } })
      .group({
        _id: '$form',
        count: { $sum: 1 },
      });
    return response;
  }
}
