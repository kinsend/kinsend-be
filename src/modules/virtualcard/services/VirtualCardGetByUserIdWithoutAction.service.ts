import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { VCard, VCardDocument } from '../virtual.card.schema';

@Injectable()
export class VirtualCardGetByUserIdWithoutAction {
  constructor(@InjectModel(VCard.name) private vcardModel: Model<VCardDocument>) {}

  async execute(context: RequestContext, id: string): Promise<VCardDocument | null> {
    return this.vcardModel.findOne({ $or: [{ userId: id }] });
  }
}
