import { Injectable } from '@nestjs/common';
import { convertStringToPhoneNumber } from '@app/utils/convertStringToPhoneNumber';
import { RequestContext } from '@app/utils/RequestContext';
import { UserFindByPhoneSystemAction } from '@app/modules/user/services/UserFindByPhoneSystemAction.service';
import { UserDocument } from '@app/modules/user/user.schema';
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
        // In this particular case, there was no Form submission so nothing for us to do.
        return;
      }

      const userModel = await this.userFindByPhoneSystemAction.execute(ownerNumber);
      if(!userModel || userModel.length === 0) {
        throw Error(`userFindByPhoneSystemAction could not find owner number: ${JSON.stringify(ownerNumber)}`)
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
