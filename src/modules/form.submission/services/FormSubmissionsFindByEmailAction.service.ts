import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionsFindByEmailAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(
    context: RequestContext,
    email?: string | null,
    owner?: string,
    isNotNull?: boolean,
  ): Promise<FormSubmissionDocument[]> {
    const conditions: any = {
      owner,
      email: isNotNull ? { $ne: null } : email,
    };

    const formSubmission = await this.formSubmissionModel.find(conditions);
    const response = await Promise.all(
      formSubmission.map((formSub: FormSubmissionDocument) =>
        formSub.populate([{ path: 'owner', select: ['_id'] }]),
      ),
    );
    return response;
  }
}
