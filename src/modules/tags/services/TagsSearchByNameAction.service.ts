import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { Tags, TagsDocument } from '../tags.schema';
import { TagsCreatePayloadDto } from '../dtos/TagsCreateRequest.dto';

@Injectable()
export class TagsSearchByName {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>) {}

  async execute(context: RequestContext, payload: TagsCreatePayloadDto): Promise<Tags | null> {
    const { user } = context;
    return this.tagsModel.findOne({
      name: payload.name,
      userId: user.id,
    });
  }
}
