import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VCard, VCardDocument } from '../virtual.card.schema';
import { EmailConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { VirtualCardService } from '../../../shared/services/virtual.card.service';
import { RequestContext } from '../../../utils/RequestContext';
import { VirtualCardCreatePayloadDto } from '../dtos/VirtualCardCreatePayload.dto';

@Injectable()
export class VirtualCardCreateAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardService: VirtualCardService,
  ) {}

  async execute(context: RequestContext, payload: VirtualCardCreatePayloadDto): Promise<VCard> {
    const { email } = payload;
    // Check case vCard not default
    if (email) {
      const checkExistedVCard = await this.vcardModel.findOne({ $or: [{ email }] });

      if (checkExistedVCard) {
        throw new EmailConflictException('VCard has already conflicted');
      }
    }
    // eslint-disable-next-line new-cap
    const vCard = new this.vcardModel({ ...payload, userId: context.user.id });
    const fileKey = `${vCard.userId}vcard`;
    const url = await this.vcardService.uploadVCard(context, fileKey, vCard);
    vCard.url = url;
    await vCard.save();
    return vCard;
  }
}
