import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardJSService } from 'src/shared/services/VCardJSService';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { VCardUpdatePayloadDto } from '../dtos/VCardUpdatePayload.dto';

@Injectable()
export class VCardUpdateByUserContextAction {
  constructor(
    @InjectModel(VCard.name) private vCardModel: Model<VCardDocument>,
    private vcardJSService: VCardJSService,
    private awsS3Service: AwsS3Service,
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
    const fileKey = vcard.userId + 'vcard';
    await this.vcardJSService.uploadVCard(context, vCardAfterUpdated, fileKey);
    const url = await this.awsS3Service.getFile(context, fileKey);
    vCardAfterUpdated.url = url;
    return vCardAfterUpdated;
  }
}
