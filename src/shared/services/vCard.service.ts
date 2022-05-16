/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContext } from 'src/utils/RequestContext';
import vCardsJS = require('vcards-js');
import * as fs from 'node:fs';
import { VCard } from 'src/modules/vcard/vcard.schema';
import { S3Service } from './s3.service';

@Injectable()
export class VCardService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  public async uploadVCard(
    context: RequestContext,
    fileKey: string,
    vcardPayload?: VCard,
  ): Promise<void> {
    const vCard = vCardsJS();
    if (vcardPayload) {
      vCard.firstName = vcardPayload.firstName || '';
      vCard.lastName = vcardPayload.lastName || '';
      vCard.email = vcardPayload.email || '';
      vCard.title = vcardPayload.title || '';
      vCard.organization = vcardPayload.organization || '';
      vCard.socialUrls['facebook'] = vcardPayload.facebook || '';
      vCard.socialUrls['linkedIn'] = vcardPayload.linkedIn || '';
      vCard.socialUrls['twitter'] = vcardPayload.twitter || '';
      vCard.socialUrls['youtube'] = vcardPayload.youtube || '';
      vCard.socialUrls['instagram'] = vcardPayload.instagram || '';
      vCard.socialUrls['snapchat'] = vcardPayload.snapchat || '';
      vCard.socialUrls['soundCloud'] = vcardPayload.soundCloud || '';
      vCard.socialUrls['store'] = vcardPayload.store || '';
      vCard.socialUrls['website'] = vcardPayload.website || '';
      vCard.homeAddress.postalCode = vcardPayload.zipCode || '';
      vCard.note = vcardPayload.note || '';
    }
    vCard.saveToFile(`${fileKey}.vcf`);
    const fileBase64 = fs.readFileSync(`${fileKey}.vcf`, { encoding: 'base64' });
    await this.s3Service.uploadFileBase64(context, fileBase64, fileKey, 'text/vcard');
    // Remove file
    fs.unlinkSync(`${fileKey}.vcf`);
  }
}
