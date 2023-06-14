import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as SendGrid from '@sendgrid/mail';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import Stripe from 'stripe';
import { Twilio } from 'twilio';
import { ConfigService } from '../../configs/config.service';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class HealthService
{
  private twilioClient: Twilio;

  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    SendGrid.setApiKey(this.configService.sendGridApiKey);
    const { twilioAccountSid, twilioAuthToken } = this.configService;
    this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: '2020-08-27',
    });
  }

  async checkStripe(request: RequestContext) {
    try {
      await this.stripe.subscriptions.list({
        limit: 1,
      });
      return HttpStatus.OK;
    } catch (error) {
      console.log(error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async checkMongoDb() {
    try {
      await this.userModel.findOne();
      return HttpStatus.OK;
    } catch (error) {
      console.log(error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async checkSendGrid() {
    const mail = {
      to: 'carlspring@gmail.com',
      from: 'support@kinsend.io',
      subject: 'Testing SendGrid',
      text: 'Hello from SendGrid!',
      html: '<p>Hello from <strong>SendGrid</strong>!</p>',
    };

    try {
      await SendGrid.send(mail);
      return HttpStatus.OK;
    } catch (error: any) {
      console.log(error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async checkTwilio() {
    try {
      // Make a test API call to Twilio to check if the connection is working
      await this.twilioClient.messages.list({ limit: 1 });
      return HttpStatus.OK;
    } catch (error) {
      console.error('Twilio connection error:', error);
      return HttpStatus.BAD_REQUEST;
    }
  }
}
