/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class FormDeleteByIdAction {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async execute(context: RequestContext, id: string): Promise<void> {
    await this.formModel.findByIdAndDelete(id);
  }
}
