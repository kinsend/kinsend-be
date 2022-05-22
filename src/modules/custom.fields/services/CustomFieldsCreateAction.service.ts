/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CustomFieldsCreatePayload } from '../dtos/CustomFieldsCreatePayload.dto';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';

@Injectable()
export class CustomFieldsCreateAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: CustomFieldsCreatePayload,
  ): Promise<CustomFieldsDocument> {
    const { user } = context;
    return new this.customFieldsModel({
      userId: user.id,
      ...payload,
    }).save();
  }
}
