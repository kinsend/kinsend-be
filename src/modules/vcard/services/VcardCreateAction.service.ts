import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { Vcard, VcardDocument } from '../vcard.schema';
import { VcardCreatePayloadDto } from '../dtos/VcardCreatePayload.dto';
import { EmailConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { VcardJSService } from 'src/shared/services/VcardJSService';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';

@Injectable()
export class VcardCreateAction {
  constructor(
    @InjectModel(Vcard.name) private vcardModel: Model<VcardDocument>,
    private vcardJSService: VcardJSService,
    private awsS3Service: AwsS3Service,
  ) {}

  async execute(context: RequestContext, payload: VcardCreatePayloadDto): Promise<Vcard> {
    const { email } = payload;
    const checkExistedVcard = await this.vcardModel.findOne({ $or: [{ email }] });

    if (checkExistedVcard) {
      throw new EmailConflictException('Vcard has already conflicted');
    }
    const vcard = await new this.vcardModel({ ...payload, userId: context.user.id }).save();
    const fileKey = vcard.userId + "vcard";
    await this.vcardJSService.uploadImage(context, vcard,fileKey);
    const url = await this.awsS3Service.getFile(context,fileKey);
    vcard.url = url;
    return vcard;
  }
}
