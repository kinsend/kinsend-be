import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { Vcard, VcardDocument } from '../vcard.schema';
import { VcardJSService } from 'src/shared/services/VcardJSService';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { VcardUpdatePayloadDto } from '../dtos/VcardUpdatePayload.dto';

@Injectable()
export class VcardUpdateByUserContextAction {
  constructor(
    @InjectModel(Vcard.name) private vcardModel: Model<VcardDocument>,
    private vcardJSService: VcardJSService,
    private awsS3Service: AwsS3Service,
  ) {}

  async execute(context: RequestContext, payload: VcardUpdatePayloadDto): Promise<Vcard> {
    const { user } = context;
    const vcard = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });

    if (!vcard) {
      throw new NotFoundException('Vcard', 'Vcard not found');
    }
    await vcard.updateOne({ ...payload });
    const vcardAfterUpdated = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });
    if (!vcardAfterUpdated) {
      throw new NotFoundException('Vcard', 'Vcard not found');
    }
    const fileKey = vcard.userId + 'vcard';
    await this.vcardJSService.uploadImage(context, vcardAfterUpdated, fileKey);
    const url = await this.awsS3Service.getFile(context, fileKey);
    vcardAfterUpdated.url = url;
    return vcardAfterUpdated;
  }
}
