import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(sendMailOptions: ISendMailOptions) {
    try {
      const data = await this.mailerService.sendMail(sendMailOptions);
      return data;
    } catch (error) {
      console.log(error)
    }

  }
}
