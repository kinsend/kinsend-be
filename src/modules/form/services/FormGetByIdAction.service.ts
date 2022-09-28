/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAMEGetByTitleAction } from '../../cname/services/CNAMEGetByTitleAction.service';

@Injectable()
export class FormGetByIdAction {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    private cnameGetByTitleAction: CNAMEGetByTitleAction,
  ) {}

  async execute(context: RequestContext, parameter: string): Promise<FormDocument> {
    let form;
    if (mongoose.Types.ObjectId.isValid(parameter)) {
      form = await this.formModel.findById(parameter);
    } else {
      const cname = await this.getCNAMEByTitle(parameter);
      form = await this.formModel.findOne({
        cname: cname.id,
      });
    }
    if (!form) {
      throw new NotFoundException('Form', 'Form not found!');
    }
    return form.populate([
      { path: 'tags' },
      { path: 'customFields' },
      { path: 'cname', select: ['-domain', '-value'] },
    ]);
  }

  private getCNAMEByTitle(title: string) {
    return this.cnameGetByTitleAction.execute(title);
  }
}
