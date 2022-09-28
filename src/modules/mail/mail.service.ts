/* eslint-disable consistent-return */
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(sendMailOptions: ISendMailOptions) {
    try {
      const data = await this.mailerService.sendMail(sendMailOptions);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
