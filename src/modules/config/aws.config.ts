import { registerAs } from '@nestjs/config';

// eslint-disable-next-line import/no-default-export
export default registerAs('aws', () => ({
  sqsUri: process.env.AWS_SQS_URI,
  sqsName: process.env.AWS_SQS_NAME,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}));
