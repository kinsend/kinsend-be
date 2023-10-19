import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataHelper } from '../../../utils/DataHelper';

import { RequestContext } from '../../../utils/RequestContext';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionFindByPhoneNumberAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(
    context: RequestContext,
    phone: PhoneNumber,
    owner?: string,
  ): Promise<FormSubmissionDocument[]> {
    // This step is necessary to remove undefined fields if any exists
    const data = JSON.parse(
      JSON.stringify(
        {
          'phoneNumber.phone': phone.phone,
          'phoneNumber.code': phone.code,
          owner,
        },
        null,
        2,
      ),
    );
    const formSubmission = await this.formSubmissionModel.find(data);
    return formSubmission;
  }
}
