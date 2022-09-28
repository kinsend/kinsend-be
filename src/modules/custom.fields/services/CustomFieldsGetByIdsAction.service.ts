/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';

@Injectable()
export class CustomFieldsGetByIdsAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(context: RequestContext, ids: string[]): Promise<CustomFields[]> {
    return this.customFieldsModel.find({
      _id: {
        $in: ids,
      },
    });
  }
}
