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
      const formSubmissions = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(phoneNumber),
      );
      if (!formSubmissions || formSubmissions.length === 0) {
        return;
      }
      const userModel = await this.userFindByPhoneSystemAction.execute(
        convertStringToPhoneNumber(ownerPhoneNumber),
      );
      const formSubmission = this.getSubcriberByOwner(formSubmissions, userModel[0]);
      await formSubmission.updateOne({
        lastContacted: new Date(),
      });
    } catch (error) {}
  }
  private getSubcriberByOwner(subscribers: FormSubmissionDocument[], owner: UserDocument) {
    const subs = subscribers.filter((sub) => sub.owner.toString() === owner._id.toString());
    return subs[0];
  }
}
