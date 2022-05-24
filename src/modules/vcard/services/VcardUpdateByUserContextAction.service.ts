import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VCardService } from '../../../shared/services/vCard.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { VCardUpdatePayloadDto } from '../dtos/VCardUpdatePayload.dto';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardCreateAction } from './VCardCreateAction.service';

@Injectable()
export class VCardUpdateByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vCardModel: Model<VCardDocument>,
    private vCardService: VCardService,
    private vCardCreateAction: VCardCreateAction,
  ) {}

  async execute(context: RequestContext, payload: VCardUpdatePayloadDto): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vCardModel.findOne({ $or: [{ userId: user.id }] });

    if (!vcard) {
      // Create new vCard
      return this.vCardCreateAction.execute(context, payload);
    }

    await vcard.updateOne({ ...payload });
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
