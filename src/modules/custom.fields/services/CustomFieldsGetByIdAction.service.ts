/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';

@Injectable()
export class CustomFieldsGetByIdAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<CustomFields> {
    const customFileds = await this.customFieldsModel.findById(id);
    if (!customFileds) {
      throw new NotFoundException('CustomFileds', 'CustomFileds not found!');
    }
    return customFileds;
  }
}
