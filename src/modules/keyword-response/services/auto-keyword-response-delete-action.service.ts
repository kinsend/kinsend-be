/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';

@Injectable()
export class AutoKeywordResponseDeleteAction {
  constructor(
    @InjectModel(AutoKeyWordResponse.name)
    private autoKeyWordResponseDocument: Model<AutoKeyWordResponseDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<any> {
    const { user } = context;
    const auto = await this.autoKeyWordResponseDocument.findById(id);
    if (!auto) {
      throw new NotFoundException('Not found!');
    }
    const { keywordResponse, index, type } = auto;
    const autoMoreAutosDeleted = await this.autoKeyWordResponseDocument.find({
      keywordResponse,
      index: {
        $gt: index,
      },
      type,
    });
    await Promise.all(
      autoMoreAutosDeleted.map((autoItem) => {
        if (autoItem.index > 0) {
          autoItem.index = autoItem.index - 1;
        }
        return autoItem.save();
      }),
    );
    await auto.delete();
  }
}
