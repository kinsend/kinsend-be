import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ConfigService as ConfigEnvService } from '../../configs/config.service';
import { MailSendGridService } from './mail-send-grid.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const smtp = configService.get('MAIL_HOST');
        const user = configService.get('MAIL_USER');
        const password = configService.get('MAIL_PASSWORD');
        const email = configService.get('MAIL_FROM');
        return {
          transport: {
            host: smtp,
            secure: false,
            auth: {
              user: user,
              pass: password,
            },
          },
          defaults: {
            from: `"No Reply" <${email}>`,
          },
          template: {
            dir: join(__dirname, '../../mail/templates'),
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, MailSendGridService, ConfigEnvService],
  exports: [MailService, MailSendGridService],
})
export class MailModule {}
