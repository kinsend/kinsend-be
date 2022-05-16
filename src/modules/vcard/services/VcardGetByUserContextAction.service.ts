import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCardService } from 'src/shared/services/vCard.service';
import { S3Service } from 'src/shared/services/s3.service';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { VCard, VCardDocument } from '../vcard.schema';

@Injectable()
export class VCardGetByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vCardService: VCardService,
    private s3Service: S3Service,
  ) {}

  async execute(context: RequestContext): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vcard) {
      throw new NotFoundException('VCard', 'VCard not found');
    }
    const fileKey = `${vcard.userId}vCard`;
    await this.vCardService.uploadVCard(context, fileKey, vcard);
    const url = await this.s3Service.getFile(context, fileKey);
    vcard.url = url;
    return vcard;
  }
}
