/* eslint-disable unicorn/filename-case */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class FormGetCNAMETitleAction {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async execute(context: RequestContext, title: string): Promise<FormDocument> {
    const form = await this.formModel
      .findOne({
        cname: {
          title,
        },
      })
      .populate(['tags', 'customFields', 'cname']);
    if (!form) {
      throw new NotFoundException('Form', 'Form not found!');
    }
    return form;
  }
}
