/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VCard, VCardDocument } from '../virtual.card.schema';
import { ConflictException } from '../../../utils/exceptions/ConflictException';
import { VirtualCardService } from '../../../shared/services/virtual.card.service';
import { RequestContext } from '../../../utils/RequestContext';
import { VirtualCardCreatePayloadDto } from '../dtos/VirtualCardCreatePayload.dto';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { getImageBase64ByUrl } from '../../../utils/getImageBase64ByUrl';

@Injectable()
export class VirtualCardCreateAction {
  constructor(
    @InjectModel(VCard.name) private vcardModel: Model<VCardDocument>,
    private vcardService: VirtualCardService,
    private userFindByIdAction: UserFindByIdAction,
  ) {}

  async execute(context: RequestContext, payload: VirtualCardCreatePayloadDto): Promise<VCard> {
    const { email } = payload;
    const user = await this.userFindByIdAction.execute(context, context.user.id);
    const vcardExistByUser = await this.vcardModel.findOne({ $or: [{ userId: user.id }] });
    if (vcardExistByUser) {
      throw new ConflictException('VCard has already conflicted');
    }

    // Check case vCard not default
    if (email) {
      const checkExistedVCard = await this.vcardModel.findOne({ $or: [{ email }] });

      if (checkExistedVCard) {
        throw new ConflictException('VCard has already conflicted');
      }
    }
    let imageBase64 = '';
    if (user.image) {
      imageBase64 = await getImageBase64ByUrl(user.image);
    }
    // eslint-disable-next-line new-cap
    const { phoneSystem, id } = user;
    let cellphone = '';
    if (phoneSystem && phoneSystem.length > 0) {
      const phoneNumber = phoneSystem[0] as PhoneNumber;
      cellphone = `+${phoneNumber.code}${phoneNumber.phone}`;
    }
    const vCard = new this.vcardModel({ ...payload, userId: id, cellphone, imageBase64 });
    const fileKey = `${vCard.userId}vcard`;
    const url = await this.vcardService.uploadVCard(context, fileKey, vCard);
    vCard.url = url;
    await vCard.save();
    return vCard;
  }
}
