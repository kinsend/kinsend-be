/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/modules/form.submission/form.submission.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { Tags, TagsDocument } from '../tags.schema';

@Injectable()
export class TagsGetAction {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>, @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>) {}

  async execute(context: RequestContext): Promise<Tags[]> {
    const { user } = context;
    const tags = await this.tagsModel.find({
      userId: user.id,
    });
    const promises = tags.map(async (tag, index) => {
      const count = await this.formSubmissionModel.find({
        tags: {
          $in: tag._id,
        },
      });
      tags[index].contacts = count.length;
    });
    await Promise.all(promises);
    return tags;
  }
}
