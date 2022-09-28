import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionFindByIdsAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, ids: string[]): Promise<FormSubmissionDocument[]> {
    return this.formSubmissionModel.find({
      _id: {
        $in: ids,
      },
    });
  }
}
