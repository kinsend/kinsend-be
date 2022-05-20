import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { TagsUpdatePayloadDto } from '../dtos/TagsUpdateRequest.dto';
import { Tags, TagsDocument } from '../tags.schema';

@Injectable()
export class TagsUpdateByIdAction {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>) {}

  async execute(
    context: RequestContext,
    tagIds: string,
    payload: TagsUpdatePayloadDto,
  ): Promise<Tags> {
    const tags = await this.tagsModel.findById(tagIds);
    if (!tags) {
      throw new NotFoundException('Tags', 'Tags not found!');
    }
    await tags.update({ ...payload });
    return (await this.tagsModel.findById(tagIds)) as Tags;
  }
}
