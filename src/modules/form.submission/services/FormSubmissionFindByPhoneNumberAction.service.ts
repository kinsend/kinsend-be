import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataHelper } from '../../../utils/DataHelper';

import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
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
    const query: any = {
      'phoneNumber.phone': phone.phone,
      'phoneNumber.code': phone.code,
    };
    if (owner) {
      query.owner = DataHelper.toObjectId(owner);
    }
    const formSubmission = await this.formSubmissionModel.find(query);
    return formSubmission;
  }
}
