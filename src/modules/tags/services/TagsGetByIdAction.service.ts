import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { Tags, TagsDocument } from '../tags.schema';

@Injectable()
export class TagsGetByIdAction {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>) {}

  async execute(context: RequestContext, tagsId: string): Promise<Tags> {
    const tags = await this.tagsModel.findById(tagsId);
    if (!tags) {
      throw new NotFoundException('Tags', 'Tags not found!');
    }
    return tags;
  }
}
