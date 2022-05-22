import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { VCard, VCardDocument } from '../vcard.schema';

@Injectable()
export class VCardGetByUserContextAction {
  constructor(@InjectModel(VCard.name) private vcardModel: Model<VCardDocument>) {}

  async execute(context: RequestContext): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vcard) {
      throw new NotFoundException('VCard', 'VCard not found');
    }

    return vcard;
  }
}
