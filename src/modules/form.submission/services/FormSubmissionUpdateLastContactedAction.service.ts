import { Injectable } from '@nestjs/common';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByPhoneSystemAction } from '../../user/services/UserFindByPhoneSystemAction.service';
import { UserDocument } from '../../user/user.schema';
import { FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionFindByPhoneNumberAction } from './FormSubmissionFindByPhoneNumberAction.service';

@Injectable()
export class FormSubmissionUpdateLastContactedAction {
  constructor(
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
  ) {}

  async execute(
    context: RequestContext,
    phoneNumber: string,
    ownerPhoneNumber: string,
  ): Promise<void> {
    try {
      context.logger.info("Triggering FormSubmissionUpdateLastContactedAction");

      const formSubmissionNumber = convertStringToPhoneNumber(phoneNumber);
      const ownerNumber = convertStringToPhoneNumber(ownerPhoneNumber);

      const formSubmissions = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        formSubmissionNumber,
      );
      if (!formSubmissions || formSubmissions.length === 0) {
        throw Error(`formSubmissionFindByPhoneNumberAction could not find number: ${formSubmissionNumber}`)
      }

      const userModel = await this.userFindByPhoneSystemAction.execute(ownerNumber);
      if(!userModel || userModel.length === 0) {
        throw Error(`userFindByPhoneSystemAction could not find owner number: ${ownerNumber}`)
      }

      const formSubmission = this.getSubscriberByOwner(formSubmissions, userModel[0]);
      if(formSubmission === null) {
        throw Error("getSubscriberByOwner returned null")
      }

      await formSubmission.updateOne({
        lastContacted: new Date(),
      });
    } catch (error) {
      context.logger.error(
        { err: error, errStack: error.stack },
        'Unable to update last contacted form submission field!',
      );
    }
  }
  private getSubscriberByOwner(subscribers: FormSubmissionDocument[], owner: UserDocument) {
    const subs = subscribers.filter((sub) => sub.owner.toString() === owner._id.toString());
    return subs[0];
  }
}
