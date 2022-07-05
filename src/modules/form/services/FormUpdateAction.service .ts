/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { FormGetByIdAction } from './FormGetByIdAction.service';
import { FormUpdatePayload } from '../dtos/FormUpdatePayload.dto';
import { TagsGetByIdAction } from '../../tags/services/TagsGetByIdAction.service';
import { CustomFieldsGetByIdsAction } from '../../custom.fields/services/CustomFieldsGetByIdsAction.service';
import { CustomFields } from '../../custom.fields/custom.fields.schema';
import { CNAMEUpdateAction } from '../../cname/services/CNAMEUpdateAction.service';

@Injectable()
export class FormUpdateAction {
  constructor(
    private tagsGetByIdAction: TagsGetByIdAction,
    private customFieldsGetByIdsAction: CustomFieldsGetByIdsAction,
    private imageUploadAction: ImageUploadAction,
    private formGetByIdAction: FormGetByIdAction,
    private cnameUpdateAction: CNAMEUpdateAction,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: FormUpdatePayload,
    file?: Express.Multer.File,
  ): Promise<FormDocument> {
    const { user } = context;
    const { tagId, customFieldsIds, cnameTitle } = payload;
    const formExist = await this.formGetByIdAction.execute(context, id);
    if (tagId) {
      const tagsExist = await this.tagsGetByIdAction.execute(context, tagId);
      formExist.tags = tagsExist;
      delete payload.tagId;
    }
    if (customFieldsIds) {
      const customFieldsExist = await this.customFieldsGetByIdsAction.execute(
        context,
        customFieldsIds,
      );
      formExist.customFields = customFieldsExist as [CustomFields];

      delete payload.customFieldsIds;
    }
    if (file) {
      const fileKey = `${user.id}.form`;
      const imageUrl = await this.imageUploadAction.execute(context, file, fileKey);
      formExist.image = imageUrl;
    }

    const { title } = formExist.cname;
    if (cnameTitle && cnameTitle !== title) {
      await this.cnameUpdateAction.execute(context, undefined, title, {
        title: cnameTitle,
      });
    }

    const formUpdated = dynamicUpdateModel<FormDocument>(payload, formExist);
    formUpdated.updatedAt = new Date();
    await formUpdated.save();

    return formUpdated.populate([
      { path: 'tags' },
      { path: 'customFields' },
      { path: 'cname', select: ['-domain', '-value'] },
    ]);
  }
}
