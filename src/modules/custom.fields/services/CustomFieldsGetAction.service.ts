/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';

@Injectable()
export class CustomFieldsGetAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(context: RequestContext): Promise<CustomFields[]> {
    const { user } = context;
    return this.customFieldsModel.find({ userId: user.id });
  }
}
