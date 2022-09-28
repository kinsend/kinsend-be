import { Injectable } from '@nestjs/common';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client as AwsS3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '../../configs/config.service';
import { RequestContext } from '../../utils/RequestContext';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { NotFoundException } from '../../utils/exceptions/NotFoundException';
import { BadRequestException } from '../../utils/exceptions/BadRequestException';

@Injectable()
export class S3Service {
  private readonly awsS3Client: AwsS3Client;

  constructor(private readonly configService: ConfigService) {
    this.awsS3Client = new AwsS3Client({
      region: this.configService.awsRegion,
    });
  }

  public async getFile(requestContext: RequestContext, awsKey: string): Promise<string> {
    try {
      const { awsImageExpireIn: expiresIn, awsBucket } = this.configService;
      const command = new GetObjectCommand({
        Bucket: awsBucket,
        Key: awsKey,
      });
      const signedUrl = await getSignedUrl(this.awsS3Client, command, {
        expiresIn,
      });
      if (signedUrl === 'https://s3.amazonaws.com/') {
        throw new IllegalStateException('Get image has broken');
      }
      return signedUrl;
    } catch (error) {
      requestContext.logger.error({ err: error }, 'get image error from s3');
      throw new NotFoundException('Image', 'Image not found');
    }
  }

  async uploadFileBase64(
    { logger }: RequestContext,
    imageBase64: string,
    awsKey: string,
    contentType: string,
  ): Promise<string> {
    try {
      const { awsBucket } = this.configService;
      const base64Data = Buffer.from(imageBase64, 'base64');
      logger.info({ awsKey, awsBucket }, 'uploading image base64 to s3');
      await this.awsS3Client.send(
        new PutObjectCommand({
          Bucket: awsBucket,
          Key: awsKey,
          Body: base64Data,
          ContentEncoding: 'base64', // required
          ContentType: contentType, // required
        }),
      );
      logger.info({ awsKey, awsBucket }, 'uploaded image base64 to s3');
      return `https://${awsBucket}.s3.amazonaws.com/${awsKey}`;
    } catch (error) {
      logger.error(
        { err: error, errStack: error.stack, imageBase64 },
        'fail to upload image to s3',
      );
      throw new BadRequestException('fail to upload image to s3');
    }
  }

  public async deleteFilesByKeys(requestContext: RequestContext, awsKeys: string[]): Promise<void> {
    if (!awsKeys || awsKeys.length === 0) {
      return;
    }
    const { awsBucket } = this.configService;

    try {
      const command = new DeleteObjectsCommand({
        Bucket: awsBucket,
        Delete: {
          Objects: awsKeys.map((awsKey) => ({
            Key: awsKey,
          })),
        },
      });
      requestContext.logger.info({ awsKeys, awsBucket }, 'deleting files from s3');
      await this.awsS3Client.send(command);
      requestContext.logger.info({ awsKeys, awsBucket }, 'deleted files from s3');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      requestContext.logger.error(
        { err: error, errStack: error.stack },
        'fail to delete files from s3',
      );
      throw new IllegalStateException('File delete from s3 error');
    }
  }
}
