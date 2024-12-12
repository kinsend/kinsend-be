/* eslint-disable no-empty */
/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable no-underscore-dangle */
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
  /**
   * Note:
   * When we use mongoose.Types.ObjectId.isValid on any input that's 12 characters long
   * it always returns true.
   * To fix this, we first convert the input into a valid ObjectId
   * If the input is actually a valid ObjectId,
   * then the value for that ObjectId will be the same as the input.
   * That's how we check whether the input is a valid ObjectId or not
   */

  async getFormByCnameTitle(title: string) {
    const cname = await this.getCNAMEByTitle(title);
    return this.formModel.findOne({
      cname: cname.id,
    });
  }

  async execute(context: RequestContext, parameter: string): Promise<FormDocument> {
    let form;
    if (parameter.length < 12) {
      form = await this.getFormByCnameTitle(parameter);
    } else {
      let parameterAsId: null | mongoose.Types.ObjectId = null;
      try {
        parameterAsId = new mongoose.Types.ObjectId(parameter);
      } catch {}
      if (parameterAsId && parameterAsId._id.toString() === parameter) {
        form = await this.formModel.findById(parameter);
      } else {
        form = await this.getFormByCnameTitle(parameter);
      }
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
