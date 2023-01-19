/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Twilio } from 'twilio';
import { TollFreeInstance } from 'twilio/lib/rest/api/v2010/account/availablePhoneNumber/tollFree';
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';
import { VerificationCheckInstance } from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import { ConfigService } from '../../configs/config.service';
import { PRICE_PER_MESSAGE_INTERNATIONAL } from '../../domain/const';
import {
  availablePhoneNumberMockResponse,
  verifyInstaceMockResponse,
} from '../../modules/resource/mocks/twilio.mock';
import { PhoneNumber } from '../../modules/user/dtos/UserResponse.dto';
import { BadRequestException } from '../../utils/exceptions/BadRequestException';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { RequestContext } from '../../utils/RequestContext';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(private readonly configService: ConfigService) {
    const { twilioAccountSid, twilioAuthToken } = this.configService;
    this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
  }

  async initiatePhoneNumberVerification(
    context: RequestContext,
    phoneNumber: string,
    useMock?: boolean,
  ): Promise<VerificationInstance> {
    const { logger, correlationId } = context;

    try {
      logger.info('Request verify phone number');

      if (useMock) {
        logger.info({
          correlationId,
          message: 'Request verify phone number successful by mock',
          data: verifyInstaceMockResponse,
        });
        return verifyInstaceMockResponse;
      }

      const { twilioVerificationServiceSid } = this.configService;
      const result = await this.twilioClient.verify
        .services(twilioVerificationServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });

      logger.info({
        correlationId,
        message: 'Request verify phone number successful',
        data: result,
      });

      return result;
    } catch (error: unknown) {
      logger.error({
        correlationId,
        message: 'Request verify phone number error',
        error,
      });
      throw new IllegalStateException('Request verify phone number not success');
    }
  }

  async confirmPhoneNumber(
    context: RequestContext,
    phoneNumber: string,
    verificationCode: string,
    useMock?: boolean,
  ): Promise<VerificationCheckInstance> {
    const { twilioVerificationServiceSid } = this.configService;
    const { logger, correlationId } = context;
    try {
      logger.info('Request confirm phone number');

      if (useMock) {
        logger.info({
          correlationId,
          message: 'Request confirm phone number successful by mock',
          data: verifyInstaceMockResponse,
        });
        return verifyInstaceMockResponse;
      }

      const result = await this.twilioClient.verify
        .services(twilioVerificationServiceSid)
        .verificationChecks.create({ to: phoneNumber, code: verificationCode });

      if (!result.valid || result.status !== 'approved') {
        throw new BadRequestException('Wrong code provided');
      }

      logger.info({
        correlationId,
        message: 'Request confirm phone number successful',
        data: result,
      });

      return result;
    } catch (error: unknown) {
      logger.error({
        correlationId,
        message: 'Request confirm phone number error',
        error,
      });
      throw new IllegalStateException('Request confirm phone number not success');
    }
  }

  async availablePhoneNumberTollFree(
    context: RequestContext,
    location = 'US',
    limit = 20,
    phoneNumber?: string,
    areaCode?: string,
    useMock?: boolean,
  ): Promise<TollFreeInstance[]> {
    const { logger, correlationId } = context;
    try {
      logger.info('Request confirm phone number');
      if (useMock) {
        logger.info({
          correlationId,
          message: 'Request rent numbers successful by mock',
          data: [availablePhoneNumberMockResponse],
        });
        return [availablePhoneNumberMockResponse];
      }

      const query: any = { limit };
      if (phoneNumber) {
        query.contains = `+${phoneNumber}`;
      }
      if (areaCode) {
        query.areaCode = areaCode;
      }
      const resultTollFree = await this.twilioClient
        .availablePhoneNumbers(location)
        .tollFree.list(query);
      const resultLocal = await this.twilioClient.availablePhoneNumbers(location).local.list(query);
      logger.info({
        correlationId,
        message: 'Request get list phone numbers available successful',
      });
      if (resultTollFree.length === 0) {
        return resultLocal;
      }
      if (resultLocal.length === 0) {
        return resultTollFree;
      }

      const numberPer = Math.round(limit / 2);
      const restNumber = limit - numberPer;
      const result = [...resultTollFree.slice(0, numberPer), ...resultLocal.slice(0, restNumber)];
      return result;
    } catch (error: any) {
      const errorMessage = error.message || error;
      logger.error({
        correlationId,
        msg: 'Request rent numbers error',
        error: errorMessage,
      });
      return [];
    }
  }

  async buyPhoneNumber(
    context: RequestContext,
    phoneNumber: PhoneNumber,
  ): Promise<IncomingPhoneNumberInstance> {
    const { logger, correlationId } = context;
    try {
      logger.info('Request buy phone numbers');
      const { code, phone } = phoneNumber;
      const result = await this.twilioClient.incomingPhoneNumbers.create({
        phoneNumber: `+${code}${phone}`,
        smsUrl: `${this.configService.backendDomain}/api/hook/sms`,
        // smsUrl: `https://dev.api.kinsend.io/api/hook/sms`,
        smsMethod: 'POST',
      });
      logger.info({
        correlationId,
        message: 'Request buy phone numbers successful',
        data: result,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || error;
      logger.error({
        correlationId,
        msg: 'Request buy phone numbers error',
        error: errorMessage,
      });
      throw new InternalServerErrorException({
        message: 'Request buy phone numbers error',
        error: errorMessage,
      });
    }
  }

  async sendVitualCardToSubscriber(
    context: RequestContext,
    message: string | undefined,
    vCardUrl: string | undefined,
    from: string,
    to: string,
    callback?: (status?: string, error?: any) => Promise<void>,
  ): Promise<void> {
    const { logger, correlationId } = context;
    try {
      const payload: MessageListInstanceCreateOptions = {
        from,
        to,
      };
      if (message) {
        payload.body = message;
      }
      if (vCardUrl) {
        payload.mediaUrl = vCardUrl;
      }
      const result = await this.twilioClient.messages.create(payload);
      logger.info({
        correlationId,
        message: 'Send VCard to subscriber successful!',
        result,
      });
      if (callback) {
        await callback();
      }
    } catch (error: any) {
      const errorMessage = error.message || error;

      logger.error({
        correlationId,
        message: 'Send VCard to subscriber fail!',
        error: errorMessage,
      });
      if (callback) {
        await callback('failed', JSON.stringify(error));
      }
    }
  }

  async sendMessage(
    context: RequestContext,
    from: string,
    message: string,
    fileUrl: string | undefined,
    to: string,
    callbackUrl?: string,
    callbackSaveSms?: (status?: string, error?: any) => Promise<any>,
  ): Promise<void> {
    const { logger, correlationId } = context;
    try {
      const payload: MessageListInstanceCreateOptions = {
        from,
        to,
      };
      if (message) {
        payload.body = message;
      }

      if (fileUrl) {
        payload.mediaUrl = fileUrl;
      }
      console.log('payload :>> ', payload);
      if (callbackUrl) {
        payload.statusCallback = `${this.configService.backendDomain}/${callbackUrl}`;
      }
      const result = await this.twilioClient.messages.create(payload);
      logger.info({
        correlationId,
        message: 'Send message successful!',
        result,
        to,
      });
      if (callbackSaveSms) {
        await callbackSaveSms();
      }
    } catch (error: any) {
      const errorMessage = error.message || error;

      logger.error({
        correlationId,
        message: 'Send message fail!',
        error: errorMessage,
        to,
      });
      if (callbackSaveSms) {
        await callbackSaveSms('failed', JSON.stringify(error));
      }
    }
  }

  async sendMessageHasThrowError(
    context: RequestContext,
    from: string,
    message: string,
    fileUrl: string | undefined,
    to: string,
    callbackSaveSms?: (status?: string, error?: any) => void,
  ): Promise<void> {
    const { logger, correlationId } = context;
    try {
      const payload: MessageListInstanceCreateOptions = {
        from,
        to,
      };
      if (message) {
        payload.body = message;
      }
      if (fileUrl) {
        payload.mediaUrl = fileUrl;
      }
      const result = await this.twilioClient.messages.create(payload);
      logger.info({
        correlationId,
        message: 'Send message successful!',
        result,
        to,
      });

      if (callbackSaveSms) {
        await callbackSaveSms();
      }
    } catch (error: any) {
      const errorMessage = error.message || error;

      logger.error({
        correlationId,
        message: 'Send message fail!',
        error: errorMessage,
        to,
      });
      if (callbackSaveSms) {
        await callbackSaveSms('failed', JSON.stringify(error));
      }
      throw new IllegalStateException(error as any);
    }
  }

  async getPriceSendMessage(context: RequestContext, region: string): Promise<number> {
    const { logger, correlationId } = context;
    try {
      const twilioClientCountries = this.twilioClient.pricing.v1.messaging.countries;
      if (!twilioClientCountries) {
        logger.error({
          correlationId,
          message: 'Get price message fail!',
        });
        return PRICE_PER_MESSAGE_INTERNATIONAL;
      }
      const countryPricing = await twilioClientCountries(region).fetch();
      const price = (countryPricing.outboundSmsPrices as any)[0].prices[0].current_price;
      return price;
    } catch (error: any) {
      const errorMessage = error.message || error;
      logger.error({
        correlationId,
        msg: 'Request buy phone numbers error',
        error: errorMessage,
      });
      return PRICE_PER_MESSAGE_INTERNATIONAL;
    }
  }
}
