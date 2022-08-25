import { Injectable } from '@nestjs/common';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionFindByPhoneNumberAction } from './FormSubmissionFindByPhoneNumberAction.service';

@Injectable()
export class FormSubmissionUpdateLastContactedAction {
  constructor(
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
  ) {}

  async execute(context: RequestContext, phoneNumber: string): Promise<void> {
    try {
      const formSubmission = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(phoneNumber),
      );
      if (!formSubmission) {
        return;
      }

      await formSubmission.updateOne({
        lastContacted: new Date(),
      });
    } catch (error) {}
  }
}
