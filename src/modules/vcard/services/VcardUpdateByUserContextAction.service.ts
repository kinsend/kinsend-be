import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCardService } from 'src/shared/services/vCard.service';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { S3Service } from 'src/shared/services/s3.service';
import { VCardUpdatePayloadDto } from '../dtos/VCardUpdatePayload.dto';
import { VCard, VCardDocument } from '../vcard.schema';

@Injectable()
export class VCardUpdateByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vCardModel: Model<VCardDocument>,
    private vCardService: VCardService,
    private s3Service: S3Service,
  ) {}

  async execute(context: RequestContext, payload: VCardUpdatePayloadDto): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vCardModel.findOne({ $or: [{ userId: user.id }] });

    if (!vcard) {
      throw new NotFoundException('VCard', 'VCard not found');
    }
    await vcard.updateOne({ ...payload });
    const vCardAfterUpdated = await this.vCardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vCardAfterUpdated) {
      throw new NotFoundException('VCard', 'VCard not found');
    }
    const fileKey = `${vcard.userId}vcard`;
    await this.vCardService.uploadVCard(context, fileKey, vCardAfterUpdated);
    const url = await this.s3Service.getFile(context, fileKey);
    vCardAfterUpdated.url = url;
    return vCardAfterUpdated;
  }
}
