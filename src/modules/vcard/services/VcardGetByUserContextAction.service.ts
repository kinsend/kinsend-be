import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardJSService } from 'src/shared/services/VCardJSService';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';

@Injectable()
export class VCardGetByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardJSService: VCardJSService,
    private awsS3Service: AwsS3Service,
  ) {}

  async execute(context: RequestContext): Promise<VCard> {
    const { user } = context;
    const vcard = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });

    if (!vcard) {
      throw new NotFoundException('VCard', 'VCard not found');
    }
    const fileKey = vcard.userId + "vCard";
    await this.vcardJSService.uploadVCard(context, vcard,fileKey);
    const url = await this.awsS3Service.getFile(context,fileKey);
    vcard.url = url;
    return vcard;
  }
}
