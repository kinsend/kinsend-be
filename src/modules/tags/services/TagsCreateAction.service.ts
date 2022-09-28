/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags, TagsDocument } from '../tags.schema';
import { TagsCreatePayloadDto } from '../dtos/TagsCreateRequest.dto';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class TagsCreateAction {
  constructor(@InjectModel(Tags.name) private tagsModel: Model<TagsDocument>) {}

  async execute(context: RequestContext, payload: TagsCreatePayloadDto): Promise<Tags> {
    const { user } = context;
    return new this.tagsModel({
      ...payload,
      userId: user.id,
    }).save();
  }
}
