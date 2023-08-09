import { registerAs } from '@nestjs/config';

// eslint-disable-next-line import/no-default-export
export default registerAs('app', () => ({
  // port: parseInt(process.env.PORT, 10) || 3200,
  // env: process.env.NODE_ENV || 'development',
  frontEndUrl: process.env.FRONT_DOMAIN || 'app.dev.kinsend.io',
}));
