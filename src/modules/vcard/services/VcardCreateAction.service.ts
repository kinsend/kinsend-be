import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { VCard, VCardDocument } from '../vcard.schema';
import { VCardCreatePayloadDto } from '../dtos/VCardCreatePayload.dto';
import { EmailConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { VCardJSService } from 'src/shared/services/VCardJSService';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';

@Injectable()
export class VCardCreateAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardJSService: VCardJSService,
    private awsS3Service: AwsS3Service,
  ) {}

  async execute(context: RequestContext, payload: VCardCreatePayloadDto): Promise<VCard> {
    const { email } = payload;
    const checkExistedVCard = await this.vcardModel.findOne({ $or: [{ email }] });

    if (checkExistedVCard) {
      throw new EmailConflictException('VCard has already conflicted');
    }
    const vCard = await new this.vcardModel({ ...payload, userId: context.user.id }).save();
    const fileKey = vCard.userId + "vCard";
    await this.vcardJSService.uploadVCard(context, vCard,fileKey);
    const url = await this.awsS3Service.getFile(context,fileKey);
    vCard.url = url;
    return vCard;
  }
}
