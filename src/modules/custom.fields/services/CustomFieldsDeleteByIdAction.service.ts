/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';

@Injectable()
export class CustomFieldsDeleteByIdAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    await this.customFieldsModel.findByIdAndDelete(id);
  }
}
