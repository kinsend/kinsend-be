import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: any, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    try {
      const data = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Nice App! Confirm your Email',
        html:`<p>Hey ${user.email},</p>
        <p>Please click below to confirm your email</p>
        <p>
            <a href="${url}">Confirm</a>
        </p>
        
        <p>If you did not request this email you can safely ignore it.</p>
        `,
        context: { 
          name: user.firstName,
          url,
        },
      });
    } catch (error) {
      console.log(error)
    }

  }
}
