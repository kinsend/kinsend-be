/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { TagsGetByIdAction } from 'src/modules/tags/services/TagsGetByIdAction.service';
import { CustomFieldsGetByIdAction } from 'src/modules/custom.fields/services/CustomFieldsGetByIdAction.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { FormGetByIdAction } from './FormGetByIdAction.service';
import { FormUpdatePayload } from '../dtos/FormUpdatePayload.dto';

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
    const formUpdate = await this.formGetByIdAction.execute(context, id);
    if (tagId) {
      const tagsExist = await this.tagsGetByIdAction.execute(context, tagId);
      formUpdate.tags = tagsExist;
    }
    if (customFieldsId) {
      const customFieldsExist = await this.customFieldsGetByIdAction.execute(
        context,
        customFieldsId,
      );
      formUpdate.customFields = customFieldsExist;
    }
    if (file) {
      const fileKey = `${user.id}.form`;
      const imageUrl = await this.imageUploadAction.execute(context, file, fileKey);
      formUpdate.image = imageUrl;
    }
    await formUpdate.save();
    return formUpdate;
  }
}
