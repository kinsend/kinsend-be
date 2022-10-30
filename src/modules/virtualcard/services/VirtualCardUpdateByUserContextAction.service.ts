/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VirtualCardService } from '../../../shared/services/virtual.card.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { getImageBase64ByUrl } from '../../../utils/getImageBase64ByUrl';
import { RequestContext } from '../../../utils/RequestContext';
import { VirtualCardUpdatePayloadDto } from '../dtos/VirtualCardUpdatePayload.dto';
import { VCard, VCardDocument } from '../virtual.card.schema';
import { VirtualCardCreateAction } from './VirtualCardCreateAction.service';

@Injectable()
export class VirtualCardUpdateByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vCardModel: Model<VCardDocument>,
    private vCardService: VirtualCardService,
    private vCardCreateAction: VirtualCardCreateAction,
  ) {}

  async execute(context: RequestContext, payload: VirtualCardUpdatePayloadDto): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vCardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vcard) {
      // Create new vCard
      return this.vCardCreateAction.execute(context, payload);
    }

    if (payload.cellphone && user.phoneSystem && user.phoneSystem.length > 0) {
      delete payload.cellphone;
    }

    let imageBase64 = '';
    if (user.image) {
      imageBase64 = await getImageBase64ByUrl(user.image);
    }

    await vcard.updateOne({ ...payload, imageBase64 });
    const vCardAfterUpdated = await this.vCardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vCardAfterUpdated) {
      throw new NotFoundException('VCard', 'VCard not found');
    }
    const fileKey = `${vcard.userId}vcard`;
    const url = await this.vCardService.uploadVCard(context, fileKey, vCardAfterUpdated);
    vCardAfterUpdated.url = url;
    // Update url after upload file
    await vCardAfterUpdated.save();
    return vCardAfterUpdated;
  }
}
