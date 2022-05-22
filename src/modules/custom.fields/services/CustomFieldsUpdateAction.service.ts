/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { CustomFieldsUpdatePayload } from '../dtos/CustomFieldsUpdatePayload.dto';
import { RequestContext } from '../../../utils/RequestContext';
import { CustomFields, CustomFieldsDocument } from '../custom.fields.schema';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';

@Injectable()
export class CustomFieldsUpdateAction {
  constructor(
    @InjectModel(CustomFields.name) private customFieldsModel: Model<CustomFieldsDocument>,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: CustomFieldsUpdatePayload,
  ): Promise<CustomFieldsDocument> {
    const customFileds = await this.customFieldsModel.findById(id);
    if (!customFileds) {
      throw new NotFoundException('CustomFileds', 'CustomFileds not found!');
    }
    const customFiledsUpdated = dynamicUpdateModel<CustomFieldsDocument>(payload, customFileds);
    await customFiledsUpdated.save();

    return customFiledsUpdated;
  }
}
