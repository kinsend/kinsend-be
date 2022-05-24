/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { FormGetByIdAction } from './FormGetByIdAction.service';
import { FormUpdatePayload } from '../dtos/FormUpdatePayload.dto';
import { TagsGetByIdAction } from '../../tags/services/TagsGetByIdAction.service';
import { CustomFieldsGetByIdAction } from '../../custom.fields/services/CustomFieldsGetByIdAction.service';

@Injectable()
export class FormUpdateAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private tagsGetByIdAction: TagsGetByIdAction,
    private customFieldsGetByIdAction: CustomFieldsGetByIdAction,
    private imageUploadAction: ImageUploadAction,
    private formGetByIdAction: FormGetByIdAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: FormUpdatePayload,
    file?: Express.Multer.File,
  ): Promise<FormDocument> {
    const { user } = context;
    const { tagId, customFieldsId } = payload;
    const formExist = await this.formGetByIdAction.execute(context, id);
    if (tagId) {
      const tagsExist = await this.tagsGetByIdAction.execute(context, tagId);
      formExist.tags = tagsExist;
      delete payload.tagId;
    }
    if (customFieldsId) {
      const customFieldsExist = await this.customFieldsGetByIdAction.execute(
        context,
        customFieldsId,
      );
      formExist.customFields = customFieldsExist;

      delete payload.customFieldsId;
    }
    if (file) {
      const fileKey = `${user.id}.form`;
      const imageUrl = await this.imageUploadAction.execute(context, file, fileKey);
      formExist.image = imageUrl;
    }

    const formUpdated = dynamicUpdateModel<FormDocument>(payload, formExist);
    formUpdated.updatedAt = new Date();
    await formUpdated.save();
    return formUpdated;
  }
}
