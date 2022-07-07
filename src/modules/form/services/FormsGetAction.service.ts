/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ngoose, { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionsCountByIdsAction } from '../../form.submission/services/FormSubmissionsCountByIdsAction.service';
import { FormSubmissionsCountResponse } from '../../form.submission/interfaces/form.submission.interface';
import { FormResponse } from '../interfaces/form.interface';

@Injectable()
export class FormsGetAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private formSubmissionsCountByIdsAction: FormSubmissionsCountByIdsAction,
  ) {}

  async execute(context: RequestContext): Promise<FormResponse[]> {
    const { user } = context;
    const forms = await this.formModel
      .find({
        userId: user.id,
      })
      .populate([
        { path: 'tags' },
        { path: 'customFields' },
        { path: 'cname', select: ['-domain', '-value'] },
      ]);
    const formIds = forms.map((form) => new ngoose.Types.ObjectId(form.id));
    const counters = await this.formSubmissionsCountByIdsAction.execute(formIds);

    return this.buildResponse(forms, counters);
  }

  private buildResponse(form: FormDocument[], counters: FormSubmissionsCountResponse[]) {
    const forms: FormResponse[] = form.map((formItem) => {
      const counter = counters.find((item) => item._id.toString() === formItem.id);
      formItem.$set('totalSubscriber', counter?.count || 0, { strict: false });
      return formItem;
    });
    return forms;
  }
}
