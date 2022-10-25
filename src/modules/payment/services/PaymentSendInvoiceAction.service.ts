/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import * as handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as puppeteer from 'puppeteer';
import * as moment from 'moment';
import { ConfigService } from '../../../configs/config.service';
import { RequestContext } from '../../../utils/RequestContext';
import { unitAmountToPrice } from 'src/utils/convertPrice';
import { MonthNames } from 'src/utils/getDayOfNextWeek';
import { MailSendGridService } from 'src/modules/mail/mail-send-grid.service';
import { UserDocument } from 'src/modules/user/user.schema';
import { MessageContext } from 'src/modules/subscription/interfaces/message.interface';
import { ICustomerInfoInvoice } from '../interface/interfaces';
import { PRICE_PER_PHONE_NUMBER, RATE_CENT_USD } from '../../../domain/const';

@Injectable()
export class PaymentSendInvoiceAction {
  constructor(
    private mailSendGridService: MailSendGridService,
    private configService: ConfigService,
  ) {}

  async execute(
    context: RequestContext,
    user: UserDocument,
    bill: Stripe.PaymentIntent,
    numberCard: string,
    type: 'UPDATE' | 'MONTHLY' | 'REGISTRY' = 'UPDATE',
    messageDomestic?: MessageContext,
    messageInternational?: MessageContext,
    smsFeeUsed?: number,
    mmsFeeUsed?: number,
    alreadyPaid?: number,
    pricePlane?: number,
    namePlane?: string,
    numberPhoneNumber?: number,
    overLimit?: number,
  ): Promise<void> {
    context.logger.info('Send mail after charged, type: ' + type);

    const customerInfo: ICustomerInfoInvoice = this.buildCustomerInfo(
      user,
      bill,
      namePlane,
      numberCard,
      pricePlane,
    );
    if (type === 'UPDATE') {
      await this.sendMailUpdateInvoice(
        user,
        customerInfo,
        bill,
        numberCard,
        messageDomestic,
        messageInternational,
      );
      return;
    }

    if (type === 'REGISTRY') {
      await this.sendMaiRegistryInvoice(user, customerInfo, bill);
      return;
    }

    await this.sendMailPaymentMonthlyInvoice(
      user,
      customerInfo,
      bill,
      smsFeeUsed,
      mmsFeeUsed,
      alreadyPaid,
      numberPhoneNumber,
      overLimit,
    );
  }

  private buildCustomerInfo(
    user: UserDocument,
    bill: Stripe.PaymentIntent,
    namePlane?: string,
    numberCard?: string,
    pricePlane?: number,
  ): ICustomerInfoInvoice {
    const { customer, amount } = bill;
    const { email, phoneNumber, firstName, lastName } = user;
    const date = new Date();
    const customerInfo: ICustomerInfoInvoice = {
      invoice_id: Math.floor(100000 + Math.random() * 900000),
      name: `${firstName} ${lastName}`,
      phoneUser: `+${phoneNumber[0].code}${phoneNumber[0].phone}`,
      email,
      customer: customer as string,
      unitsUsed: 1,
      unitsPlane: 1,
      units: 1,
      name_plane: namePlane || '',
      logo: 'https://www.dev.kinsend.io/static/media/logo.961c15e5ab6169b8a855d4db11ed84e7.svg',
      number_card: numberCard || '',
      total_paid: unitAmountToPrice(amount),
      invoice_date: `${MonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
      price_plane: unitAmountToPrice(pricePlane || 0),
      datetime_paid: `${date.getDate()} ${
        MonthNames[date.getMonth()]
      }, ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} EDT`,
    };
    return customerInfo;
  }

  private async sendMailUpdateInvoice(
    user: UserDocument,
    customerInfo: ICustomerInfoInvoice,
    bill: Stripe.PaymentIntent,
    numberCard: string,
    messageDomestic?: MessageContext,
    messageInternational?: MessageContext,
  ) {
    const { id, amount } = bill;
    const { email } = user;
    const date = new Date();
    const filePath = path.join(
      __dirname,
      '../../../../views/templates/mail/payment_message_update.html',
    );
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const { mailForm } = this.configService;
    const replacements = {
      ...customerInfo,
      numberSegment: 1,
      domestic_mes: messageDomestic?.totalMessages || 0,
      international_mes: messageInternational?.totalMessages || 0,
      charge_price: unitAmountToPrice(amount),
      total_price: unitAmountToPrice(amount),
      billing_datetime: `${MonthNames[date.getMonth()]} ${date.getDate()} to ${
        MonthNames[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`,
    };
    const htmlToSend = template(replacements);

    await this.createFilePDF(id, htmlToSend);
    const pathInvoice = `./invoice_${id}.pdf`;
    const invoice = fs.readFileSync(pathInvoice).toString('base64');
    const mail = {
      to: email,
      subject: 'Kinsend - Thanks for your payment!',
      from: mailForm,
      html: `Hello,<br>
      <br>
      Thank you for the payment.<br>
      <br>
      Payment details are given below:<br>
      <br>
      Date: ${date.getDate()}-${MonthNames[date.getMonth()]}-${date.getFullYear()}<br>
      Invoice: ${replacements.invoice_id}<br>
      <br>
      Items:<br>
      <br>
      Description : Charge for sending an update with 1 segments to ${
        messageDomestic?.totalMessages || 0
      } US numbers and ${messageInternational?.totalMessages || 0} international numbers.<br>
      Unit Cost : ${replacements.total_price || 0}<br>
      Quantity : 1<br>
      Price : ${replacements.total_price || 0}<br>
      <br>
      Total Amount: ${replacements.total_price || 0}<br>
      <br>
      Thanks again for your purchase. If you have any questions, please contact us.<br>
      Thank You.`,
      attachments: [
        {
          content: invoice,
          filename: 'invoice.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    await this.mailSendGridService.sendUserStatusPayment(mail);

    // Delete file
    fs.unlinkSync(pathInvoice);
  }

  private async sendMailPaymentMonthlyInvoice(
    user: UserDocument,
    customerInfo: ICustomerInfoInvoice,
    bill: Stripe.PaymentIntent,
    smsFeeUsed?: number,
    mmsFeeUsed?: number,
    alreadyPaid?: number,
    numberPhoneNumber?: number,
    overLimit?: number,
  ) {
    const { id, amount } = bill;
    const { email } = user;
    const date = new Date();
    const lastMonth = moment(date).subtract(1, 'month').toDate();
    const nextMonth = moment(date).add(1, 'month').toDate();

    const filePath = path.join(__dirname, '../../../../views/templates/mail/payment_monthly.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const { mailForm } = this.configService;
    const feePhoneNumber = (numberPhoneNumber || 0) * PRICE_PER_PHONE_NUMBER * RATE_CENT_USD;
    const totalPaid = (smsFeeUsed || 0) + (mmsFeeUsed || 0) + (alreadyPaid || 0) + feePhoneNumber;
    const replacements: any = {
      ...customerInfo,
      total_fee_sms: unitAmountToPrice(smsFeeUsed || 0),
      total_fee_mms: unitAmountToPrice(mmsFeeUsed || 0),
      already_paid: unitAmountToPrice(alreadyPaid || 0),
      over_limit: unitAmountToPrice(overLimit || 0),
      total_used: unitAmountToPrice(totalPaid),
      current_date_plane: `${MonthNames[lastMonth.getMonth()]} ${lastMonth.getDate()} to ${
        MonthNames[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`,
      next_date_plane: `${MonthNames[date.getMonth()]} ${date.getDate()} to ${
        MonthNames[nextMonth.getMonth()]
      } ${(nextMonth.getDate(), nextMonth.getFullYear())}`,
      total_paid: unitAmountToPrice(amount),
      next_date_bill: `${
        MonthNames[nextMonth.getMonth()]
      } ${nextMonth.getDate()} ${nextMonth.getFullYear()}`,
      fee_phone_number: unitAmountToPrice(feePhoneNumber),
    };
    const htmlToSend = template(replacements);

    await this.createFilePDF(id, htmlToSend);
    const pathInvoice = `./invoice_${id}.pdf`;
    const invoice = fs.readFileSync(pathInvoice).toString('base64');
    const mail = {
      to: email,
      subject: 'Kinsend - Thanks for your payment!',
      from: mailForm,
      html: `Hello,<br>
      <br>
      Thank you for the payment.<br>
      <br>
      Payment details are given below:<br>
      <br>
      Date: ${date.getDate()}-${MonthNames[date.getMonth()]}-${date.getFullYear()}<br>
      Invoice: ${replacements.invoice_id}<br>
      <br>
      Items:<br>
      <br>
      Description : Kinsend Starter<br>
      Unit Cost : ${replacements.price_plane}<br>
      Quantity : 1<br>
      Price : ${replacements.price_plane}<br>
      <br>

      <br>
      Description :  Previous Billing Period Usage: SMS ${replacements.total_fee_sms}, MMS ${
        replacements.total_fee_mms
      }Phone number ${replacements.fee_phone_number}, Already Paid ${replacements.already_paid} <br>
      Unit Cost : ${replacements.over_limit || 0}<br>
      Quantity : 1<br>
      Price : ${replacements.over_limit || 0}<br>
      <br>
      Total Amount: ${replacements.over_limit || 0}<br>
      <br>
      Thanks again for your purchase. If you have any questions, please contact us.<br>
      Thank You.`,
      attachments: [
        {
          content: invoice,
          filename: 'invoice.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    await this.mailSendGridService.sendUserStatusPayment(mail);

    // Delete file
    fs.unlinkSync(pathInvoice);
  }

  private async sendMaiRegistryInvoice(
    user: UserDocument,
    customerInfo: ICustomerInfoInvoice,
    bill: Stripe.PaymentIntent,
  ) {
    const { id } = bill;
    const { email } = user;
    const date = new Date();
    const nextMonth = moment(date).add(1, 'month').toDate();

    const filePath = path.join(__dirname, '../../../../views/templates/mail/payment_registry.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const { mailForm } = this.configService;
    const replacements = {
      ...customerInfo,
      datePlane: `${MonthNames[date.getMonth()]} ${date.getDate()} to ${
        MonthNames[nextMonth.getMonth()]
      } ${nextMonth.getDate()}`,
      next_billing_datetime: `${
        MonthNames[nextMonth.getMonth()]
      } ${nextMonth.getDate()} ${nextMonth.getFullYear()}`,
    };
    const htmlToSend = template(replacements);

    await this.createFilePDF(id, htmlToSend);
    const pathInvoice = `./invoice_${id}.pdf`;
    const invoice = fs.readFileSync(pathInvoice).toString('base64');
    const mail = {
      to: email,
      subject: 'Kinsend - Thanks for your payment!',
      from: mailForm,
      html: `Hello,<br>
      <br>
      Thank you for the payment.<br>
      <br>
      Payment details are given below:<br>
      <br>
      Date: ${date.getDate()}-${MonthNames[date.getMonth()]}-${date.getFullYear()}<br>
      Invoice: ${replacements.invoice_id}<br>
      <br>
      Items:<br>
      <br>
      Description : Kinsend Starter<br>
      Unit Cost : ${replacements.total_paid}<br>
      Quantity : 1<br>
      Price : ${replacements.total_paid}<br>
      <br>
      Total Amount: ${replacements.total_paid}<br>
      <br>
      Thanks again for your purchase. If you have any questions, please contact us.<br>
      Thank You.`,
      attachments: [
        {
          content: invoice,
          filename: 'invoice.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    await this.mailSendGridService.sendUserStatusPayment(mail);

    // Delete file
    fs.unlinkSync(pathInvoice);
  }

  private async createFilePDF(id: string, htmlToSend: string): Promise<any> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://google.ru', { waitUntil: 'networkidle0' }); // <== This should help
    await page.setContent(htmlToSend, { waitUntil: 'networkidle0' });
    await page.waitForSelector('img');
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      path: `./invoice_${id}.pdf`,
      printBackground: true,
      format: 'A4',
      margin: { top: '0.5cm', right: '1cm', bottom: '0.8cm', left: '1cm' },
    });
    await browser.close();
  }
}
