import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client as AwsS3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// eslint-disable-next-line unicorn/prefer-node-protocol
import stream, { Stream } from 'stream';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { IllegalStateException } from 'src/utils/exceptions/IllegalStateException';
import {Logger} from "../../utils/Logger";
import { ConfigService } from 'src/configs/config.service';
import { RequestContext } from 'src/utils/RequestContext';
import { extractExtensionFromImageBase64 } from 'src/utils/imageBase64Helpers';
import { BadRequestException } from 'src/utils/exceptions/BadRequestException';

@Injectable()
export class AwsS3Service {
  private readonly awsS3Client: AwsS3Client;

  constructor(private readonly configService: ConfigService) {
    this.awsS3Client = new AwsS3Client({
      region: this.configService.awsRegion
    });
  }

  public async getImage(
    requestContext: RequestContext,
    awsKey: string,
  ): Promise<string> {
    try {
      const {awsImageExpireIn: expiresIn, awsBucket} = this.configService;
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
  async uploadImageBase64(
    { logger }: RequestContext,
    imageBase64: string,
    awsKey: string,
  ): Promise<void> {
    try {
      const {awsBucket} = this.configService;
      const base64Data = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const extension = extractExtensionFromImageBase64(imageBase64);

      logger.info({ awsKey, awsBucket: awsBucket }, "uploading image base64 to s3");
      await this.awsS3Client.send(
        new PutObjectCommand({
          Bucket: awsBucket,
          Key: awsKey,
          Body: base64Data,
          ContentEncoding: "base64", // required
          ContentType: `image/${extension}`, // required
        }),
      );
      logger.info({ awsKey, awsBucket: awsBucket }, "uploaded image base64 to s3");
    } catch (error) {
      logger.error(
        { err: error, errStack: error.stack, imageBase64 },
        "fail to upload image to s3",
      );
      throw new BadRequestException("fail to upload image to s3");
    }
  }


  public async deleteFilesByKeys(
    requestContext: RequestContext,
    awsBucket: string,
    awsKeys: string[],
  ): Promise<void> {
    if (!awsKeys || awsKeys.length === 0) {
      return;
    }

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
