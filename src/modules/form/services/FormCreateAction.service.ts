/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { FormCreatePayload } from '../dtos/FormCreatePayload.dto';
import { TagsGetByIdAction } from '../../tags/services/TagsGetByIdAction.service';
import { CustomFieldsGetByIdsAction } from '../../custom.fields/services/CustomFieldsGetByIdsAction.service';
import { CNAMECreateAction } from '../../cname/services/CNAMECreateAction.service';

@Injectable()
export class FormCreateAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private tagsGetByIdAction: TagsGetByIdAction,
    private customFieldsGetByIdsAction: CustomFieldsGetByIdsAction,
    private imageUploadAction: ImageUploadAction,
    private cnameCreateAction: CNAMECreateAction,
  ) {}

  async execute(
    context: RequestContext,
    file: Express.Multer.File,
    payload: FormCreatePayload,
  ): Promise<FormDocument> {
    const { user } = context;
    const { tagId } = payload;
    const formExist = await this.formModel.findOne({
      url: payload.url,
    });
    if (formExist) {
      throw new ConflictException('Form url already exist');
    }

    let tagsExist: any = null;
    if (tagId) {
      tagsExist = await this.tagsGetByIdAction.execute(context, tagId);
    }
    const customFieldsExist = await this.customFieldsGetByIdsAction.execute(
      context,
      payload.customFieldsIds || [],
    );
    const fileKey = `${user.id}.form`;
    let imageUrl = '';
    if (file) {
      await this.imageUploadAction.execute(context, file, fileKey);
    }
    // Create cname
    const cname = await this.cnameCreateAction.execute(context, { title: payload.cnameTitle });

    const response = await new this.formModel({
      ...payload,
      image: imageUrl,
      tags: tagsExist,
      customFields: customFieldsExist,
      userId: user.id,
      cname,
    }).save();
    return response.populate([
      { path: 'tags' },
      { path: 'customFields' },
      { path: 'cname', select: ['-domain', '-value'] },
    ]);
  }
}
