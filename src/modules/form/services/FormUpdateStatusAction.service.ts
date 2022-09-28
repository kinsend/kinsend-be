/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { FormGetByIdAction } from './FormGetByIdAction.service';
import { FormUpdateStatusPayload } from '../dtos/FormUpdateStatusPayload.dto';

@Injectable()
export class FormUpdateStatusAction {
  constructor(private formGetByIdAction: FormGetByIdAction) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: FormUpdateStatusPayload,
  ): Promise<FormDocument> {
    const formExist = await this.formGetByIdAction.execute(context, id);

    formExist.status = payload.status;
    formExist.updatedAt = new Date();
    await formExist.save();

    return formExist.populate([
      { path: 'tags' },
      { path: 'customFields' },
      { path: 'cname', select: ['-domain', '-value'] },
    ]);
  }
}
