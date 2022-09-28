import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { VCard, VCardDocument } from '../virtual.card.schema';

@Injectable()
export class VirtualCardGetByUserIdAction {
  constructor(@InjectModel(VCard.name) private vcardModel: Model<VCardDocument>) {}

  async execute(context: RequestContext, id: string): Promise<VCardDocument> {
    const vcard = await this.vcardModel.findOne({ $or: [{ userId: id }] });
    if (!vcard) {
      throw new NotFoundException('VCard', 'VCard not found');
    }

    return vcard;
  }
}
