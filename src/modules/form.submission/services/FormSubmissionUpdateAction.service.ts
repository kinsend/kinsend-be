/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { TagsGetByIdsAction } from 'src/modules/tags/services/TagsGetByIdsAction.service';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionUpdatePayload } from '../dtos/FormSubmissionUpdatePayload.dto';
import { FormSubmissionModule } from '../form.submission.module';
import { FormSubmissionDocument } from '../form.submission.schema';
import { FormSubmissionFindByIdAction } from './FormSubmissionFindByIdAction.service';

@Injectable()
export class FormSubmissionUpdateAction {
  constructor(
    private formSubmissionFindByIdAction: FormSubmissionFindByIdAction,
    private tagsGetByIdsAction: TagsGetByIdsAction,
  ) {}

  async execute(
    context: RequestContext,
    formSubId: string,
    payload: FormSubmissionUpdatePayload,
  ): Promise<FormSubmissionDocument> {
    const { tagIds } = payload;
    const formSubmissionExist = await this.formSubmissionFindByIdAction.execute(context, formSubId);
    const formUpdate = dynamicUpdateModel<FormSubmissionDocument>(payload, formSubmissionExist);

    if (tagIds && tagIds.length > 0) {
      formUpdate.tags = await this.tagsGetByIdsAction.execute(context, tagIds);
    }
    await formUpdate.save();

    return formUpdate.populate([
      { path: 'form' },
      { path: 'tags' },
      { path: 'owner', select: ['-password'] },
    ]);
  }
}
