import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ngoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { Tags, TagsDocument } from '../tags.schema';

@Injectable()
export class TagsGetByIdsAction {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>) {}

  async execute(context: RequestContext, tagsIds: string[]): Promise<Tags[]> {
    const tagObjectIds = tagsIds.map((tagId) => new ngoose.Types.ObjectId(tagId));
    return this.tagsModel.find({
      _id: {
        $in: tagObjectIds,
      },
    });
  }
}
