import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3200),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  AWS_SQS_URI: Joi.string().required(),
  AWS_SQS_NAME: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
});
