/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionUpdatePayload } from '../dtos/FormSubmissionUpdatePayload.dto';
import { FormSubmissionFindByIdAction } from './FormSubmissionFindByIdAction.service';

@Injectable()
export class FormSubmissionUpdateAction {
  constructor(private formSubmissionFindByIdAction: FormSubmissionFindByIdAction) {}

  async execute(
    context: RequestContext,
    formSubId: string,
    payload: FormSubmissionUpdatePayload,
  ): Promise<FormSubmissionDocument> {
    const { email, firstName, lastName, location, metaData } = payload;
    const formSubmissionExist = await this.formSubmissionFindByIdAction.execute(context, formSubId);
    if (email) {
      formSubmissionExist.email = email;
    }
    if (firstName) {
      formSubmissionExist.firstName = firstName;
    }
    if (lastName) {
      formSubmissionExist.lastName = lastName;
    }
    if (location) {
      formSubmissionExist.location = location;
    }
    if (metaData) {
      formSubmissionExist.metaData = metaData;
    }
    await formSubmissionExist.save();

    return formSubmissionExist.populate([
      { path: 'form' },
      { path: 'owner', select: ['-password'] },
    ]);
  }
}
