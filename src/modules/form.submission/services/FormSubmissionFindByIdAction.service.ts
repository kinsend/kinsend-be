import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionFindByIdAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<FormSubmissionDocument> {
    const formSubmission = await this.formSubmissionModel.findOne({
      _id: id,
      owner: context.user.id,
    });
    if (!formSubmission) {
      throw new NotFoundException('FormSubmission', 'Contact not found!');
    }
    const user = await formSubmission.populate('tags');
    return user;
  }
}
