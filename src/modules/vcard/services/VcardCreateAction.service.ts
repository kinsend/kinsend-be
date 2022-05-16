import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardCreatePayloadDto } from '../dtos/VCardCreatePayload.dto';
import { EmailConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { VCardService } from 'src/shared/services/vCard.service';
import { S3Service } from 'src/shared/services/s3.service';

@Injectable()
export class VCardCreateAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardService: VCardService,
    private s3Service: S3Service,
  ) {}

  async execute(context: RequestContext, payload: VCardCreatePayloadDto): Promise<VCard> {
    const { email } = payload;
    const checkExistedVCard = await this.vcardModel.findOne({ $or: [{ email }] });

    if (checkExistedVCard) {
      throw new EmailConflictException('VCard has already conflicted');
    }
    const vCard = await new this.vcardModel({ ...payload, userId: context.user.id }).save();
    const fileKey = vCard.userId + "vCard";
    await this.vcardService.uploadVCard(context, vCard,fileKey);
    const url = await this.s3Service.getFile(context,fileKey);
    vCard.url = url;
    return vCard;
  }
}
