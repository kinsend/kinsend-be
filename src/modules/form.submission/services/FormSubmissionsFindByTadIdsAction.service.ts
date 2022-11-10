import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionsFindByTadIdsAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(
    context: RequestContext,
    tagIds: string | string[],
  ): Promise<FormSubmissionDocument[]> {
    const tagIdsParam = Array.isArray(tagIds) ? tagIds : [tagIds];
    return this.formSubmissionModel.find({
      tags: {
        $in: tagIdsParam,
      },
      isSubscribed: true,
    });
  }
}
