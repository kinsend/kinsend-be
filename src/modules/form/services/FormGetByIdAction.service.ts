/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class FormGetByIdAction {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async execute(context: RequestContext, id: string): Promise<FormDocument> {
    const form = await this.formModel.findById(id).populate(['tags', 'customFields']);
    if (!form) {
      throw new NotFoundException('Form', 'Form not found!');
    }
    return form;
  }
}
