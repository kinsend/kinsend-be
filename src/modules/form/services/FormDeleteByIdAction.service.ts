/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAMEDeleteByIdAction } from '../../cname/services/CNAMEDeleteByIdAction.service';
import { FormGetByIdAction } from './FormGetByIdAction.service';

@Injectable()
export class FormDeleteByIdAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private cnameDeleteByIdAction: CNAMEDeleteByIdAction,
    private formGetByIdAction: FormGetByIdAction,
  ) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    const form = await this.formGetByIdAction.execute(context, id);

    await form.delete();
    await this.cnameDeleteByIdAction.execute(context, form.cname._id.toString());
  }
}
