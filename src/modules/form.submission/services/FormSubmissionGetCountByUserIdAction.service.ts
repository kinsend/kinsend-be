/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionGetCountByUserIdAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.formSubmissionModel.count({
      owner: userId,
    });
  }
}
