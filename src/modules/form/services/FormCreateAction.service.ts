/* eslint-disable new-cap */
import { Injectable, ConflictException } from '@nestjs/common';
import { TagsGetByIdAction } from 'src/modules/tags/services/TagsGetByIdAction.service';
import { CustomFieldsGetByIdAction } from 'src/modules/custom.fields/services/CustomFieldsGetByIdAction.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { FormCreatePayload } from '../dtos/FormCreatePayload.dto';

@Injectable()
export class FormCreateAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private tagsGetByIdAction: TagsGetByIdAction,
    private customFieldsGetByIdAction: CustomFieldsGetByIdAction,
    private imageUploadAction: ImageUploadAction,
  ) {}

  async execute(
    context: RequestContext,
    file: Express.Multer.File,
    payload: FormCreatePayload,
  ): Promise<FormDocument> {
    const { user } = context;
    const formExist = await this.formModel.findOne({
      url: payload.url,
    });
    if (formExist) {
      throw new ConflictException('Form url already exist');
    }

    const tagsExist = await this.tagsGetByIdAction.execute(context, payload.tagId);
    const customFieldsExist = await this.customFieldsGetByIdAction.execute(
      context,
      payload.customFieldsId,
    );
    const fileKey = `${user.id}.form`;
    const imageUrl = await this.imageUploadAction.execute(context, file, fileKey);
    return new this.formModel({
      ...payload,
      image: imageUrl,
      tags: tagsExist,
      customFields: customFieldsExist,
      userId: user.id,
    }).save();
  }
}
