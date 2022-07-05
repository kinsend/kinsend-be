/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from '../form.schema';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class FormsGetAction {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async execute(context: RequestContext): Promise<FormDocument[]> {
    const { user } = context;
    return this.formModel
      .find({
        userId: user.id,
      })
      .populate([
        { path: 'tags' },
        { path: 'customFields' },
        { path: 'cname', select: ['-domain', '-value'] },
      ]);
  }
}
