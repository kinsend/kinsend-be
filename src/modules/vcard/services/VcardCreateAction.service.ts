import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardCreatePayloadDto } from '../dtos/VCardCreatePayload.dto';
import { EmailConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { VCardService } from '../../../shared/services/vCard.service';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class VCardCreateAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardService: VCardService,
  ) {}

  async execute(context: RequestContext, payload: VCardCreatePayloadDto): Promise<VCard> {
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
