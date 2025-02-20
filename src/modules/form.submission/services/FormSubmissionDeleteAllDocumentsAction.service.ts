import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '@app/utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionDeleteAllDocumentsAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, formSubmissionIds: string[]) {
    await this.formSubmissionModel.deleteMany({
      owner: context.user.id,
      _id: { $in: formSubmissionIds },
    });

    return { message: 'User deleted successfully' };
  }
}
