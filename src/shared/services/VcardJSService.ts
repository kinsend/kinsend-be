import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContext } from 'src/utils/RequestContext';
import vCardsJS = require('vcards-js');
import * as fs from 'fs';
import { Vcard } from 'src/modules/vcard/vcard.schema';
import { AwsS3Service } from './AwsS3Service';

@Injectable()
export class VcardJSService {
  constructor(
    private readonly configService: ConfigService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  public async uploadImage(
    context: RequestContext,
    vcardPayload: Vcard,
    fileKey: string,
  ): Promise<void> {
    const vCard = vCardsJS();
    vCard.firstName = vcardPayload.firstName;
    vCard.lastName = vcardPayload.lastName;
    vCard.email = vcardPayload.email;
    vCard.title = vcardPayload.title;
    vCard.organization = vcardPayload.organization;
    vCard.socialUrls['facebook'] = vcardPayload.facebook;
    vCard.socialUrls['linkedIn'] = vcardPayload.linkedIn;
    vCard.socialUrls['twitter'] = vcardPayload.twitter;
    vCard.socialUrls['youtube'] = vcardPayload.youtube;
    vCard.socialUrls['instagram'] = vcardPayload.instagram;
    vCard.socialUrls['snapchat'] = vcardPayload.snapchat;
    vCard.socialUrls['soundCloud'] = vcardPayload.soundCloud;
    vCard.socialUrls['store'] = vcardPayload.store;
    vCard.socialUrls['website'] = vcardPayload.website;
    vCard.homeAddress.postalCode = vcardPayload.zipCode;
    vCard.note = vcardPayload.note;
    vCard.saveToFile(`${fileKey}.vcf`);
    const fileBase64 = fs.readFileSync(`${fileKey}.vcf`, { encoding: 'base64' });
    await this.awsS3Service.uploadFileBase64(context, fileBase64,fileKey, "text/vcard");
    // Remove file
    fs.unlinkSync(`${fileKey}.vcf`);
  }
}
