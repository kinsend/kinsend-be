/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable prettier/prettier */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/catch-error-name */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable unicorn/filename-case */
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as QueryString from 'qs';
import { ConfigService } from 'src/configs/config.service';
import { REGISTRATION_STATUS } from 'src/domain/const';
import { PlanSubscriptionGetByUserIdAction } from 'src/modules/plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import { RequestContext } from 'src/utils/RequestContext';
import { Twilio } from 'twilio';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { A2pRegistration, A2pRegistrationDocument } from '../a2p-registration.schema';
import { PlanSubscriptionCreateAction } from 'src/modules/plan-subscription/services/plan-subscription-create-action.service';
import { PLAN_PAYMENT_METHOD, PLAN_SUBSCRIPTION_STATUS } from 'src/modules/plan-subscription/plan-subscription.constant';

@Injectable()
export class A2pBrandStatusService {
  private twilioClient: Twilio;

  constructor(
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
    private readonly configService: ConfigService,
    private httpService: HttpService,
    private planSubscriptionGetByUserIdAction:PlanSubscriptionGetByUserIdAction,
    private planSubscriptionCreateAction:PlanSubscriptionCreateAction,
  ) {
    const { twilioAccountSid, twilioAuthToken } = this.configService;
    this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
  }
  async execute(context: RequestContext): Promise<any> {
    const { logger } = context;
    const { phoneSystem } = context.user;
    if (!phoneSystem || (phoneSystem as PhoneNumber[]).length === 0) {
      logger.info('Skip Registration status Check. Phone number is empty!');
      throw new HttpException('Phone number is empty!', HttpStatus.BAD_REQUEST);
    }
    const phoneNumber = `+${phoneSystem[0].code}${phoneSystem[0].phone}`;

    const userA2pInfo = await this.a2pRegistration.findOne({ userId: context.user.id });
    if (!userA2pInfo) {
      throw new HttpException(
        {
          status: 'NOT_REGISTERED',
          message: 'User not registered',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('userA2pInfo', userA2pInfo);

    const { submittedFormValues } = userA2pInfo;
    const formValues = JSON.parse(submittedFormValues);

    if (userA2pInfo.progress === 'APPROVED') {
      return {
        status: 'USER VERIFIED',
        message: 'User approved',
        planType: formValues.planType,
        useCase: formValues.usAppToPersonUsecase,
      };
    }
    if (userA2pInfo.brandStatus !== 'APPROVED') {
      const brandStatusResponse = await this.fetchBrandStatus(context, userA2pInfo.brandSid);
      console.log('brandStatusResponse', brandStatusResponse);
      if (brandStatusResponse.status === 'FAILED') {
        console.log(`brandStatusResponse Failed for ${context.user.email}`, brandStatusResponse);
        return {
          status: 'FAILED',
          message: 'User Brand registration is FAILED',
          planType: formValues.planType,
          useCase: formValues.usAppToPersonUsecase,
          errorFeedBack: brandStatusResponse.brandFeedback,
        };
      }
      if (brandStatusResponse.status === 'PENDING') {
        return {
          status: 'PENDING',
          message: 'User pending',
          planType: formValues.planType,
          useCase: formValues.usAppToPersonUsecase,
          createdAt: userA2pInfo?.createdAt,
        };
      }

      if (brandStatusResponse.status === 'APPROVED') {
        // Creating Campaign
        const form = JSON.parse(userA2pInfo.submittedFormValues);
        let createA2pCampaignRes;
        try {
          createA2pCampaignRes = await this.createA2pCompaign(
            context,
            userA2pInfo.messageServiceSid,
            userA2pInfo.brandSid,
            form.description,
            form.messageFlow,
            form.messageSample,
            form.usAppToPersonUsecase,
          );
          console.log('createA2pCampaignRes', createA2pCampaignRes);
        } catch (error) {
          console.log('error --- ', error);
          throw new HttpException({
            profileStatus: 'FAILED',
            message: `${error.response.message}`,
          }, HttpStatus.BAD_REQUEST);
        }

        try {
          userA2pInfo.brandStatus = 'APPROVED';
          userA2pInfo.campaignStatus = createA2pCampaignRes.campaign_status;
          await userA2pInfo.save();

          return {
            createA2pCampaignRes,
            status: 'PENDING',
            message: 'Campaign Created verification is in progress',
            planType: formValues.planType,
            useCase: formValues.usAppToPersonUsecase,
            createdAt: userA2pInfo?.createdAt,
          };
        } catch (error) {
          throw new HttpException(
            `Error while saving data in mongo ${error}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    if (userA2pInfo?.campaignStatus === 'VERIFIED') {
      return {
        status: 'APPROVED',
        message: 'Campaign verification is APPROVED',
        planType: formValues.planType,
        useCase: formValues.usAppToPersonUsecase,
      };
    }

    if (userA2pInfo?.campaignStatus === 'IN_PROGRESS') {
      // Fetching Campaign Status
      const campaignStatusResponse = await this.fetchCampaignStatus(
        context,
        userA2pInfo.messageServiceSid,
      );

      if (campaignStatusResponse?.campaign_status === 'IN_PROGRESS') {
        return {
          status: 'PENDING',
          message: 'Campaign verification is in progress',
          planType: formValues.planType,
          useCase: formValues.usAppToPersonUsecase,
          createdAt: userA2pInfo?.createdAt,
        };
      }
      if (campaignStatusResponse?.campaign_status === 'FAILED') {
        console.log(
          `campaignStatusResponse Failed for ${context.user.email}`,
          campaignStatusResponse,
        );

        console.log('campaignStatusResponse Errors', JSON.stringify(campaignStatusResponse.errors));

        return {
          status: 'FAILED',
          message: 'Campaign verification is FAILED',
          planType: formValues.planType,
          useCase: formValues.usAppToPersonUsecase,
        };
      }
      if (campaignStatusResponse?.campaign_status === 'VERIFIED') {
        // Associating Campaign with Number

        try {
          const config: any = {
            method: 'get',
            url: `https://api.twilio.com/2010-04-01/Accounts/${this.configService.twilioAccountSid}/IncomingPhoneNumbers.json?PhoneNumber=${phoneNumber}`,
            auth: {
              username: this.configService.twilioAccountSid,
              password: this.configService.twilioAuthToken,
            },
          };

          const fetchNumberSid: any = await this.httpService.axiosRef(config);

          const phoneNmberSid = fetchNumberSid.data.incoming_phone_numbers[0].sid;

          const associateNumberWithCampaign = await this.addPhoneNumberToMessageingService(
            context,
            userA2pInfo.messageServiceSid,
            phoneNmberSid,
          );

          userA2pInfo.progress = REGISTRATION_STATUS.APPROVED;
          userA2pInfo.campaignStatus = 'VERIFIED';
          await userA2pInfo.save();

          // Update the registrationDate in PlanSubscription (For Monthly Cron task Payments)
          const planSubscription = await this.planSubscriptionGetByUserIdAction.execute(
            context.user.id,
          );
          if(planSubscription) {
            planSubscription.a2pApprovalDate = new Date();
            await planSubscription.save();
          } else {
            await this.planSubscriptionCreateAction.execute(context, {
              planPaymentMethod: PLAN_PAYMENT_METHOD.MONTHLY,
              priceId: context.user.priceSubscribe || '',
              status: PLAN_SUBSCRIPTION_STATUS.ACTIVE,
              userId: context.user.id,
              registrationDate: new Date(),
              a2pApprovalDate: new Date(),
            });
          }

          return {
            status: 'APPROVED',
            message: 'Campaign verification is APPROVED',
            planType: formValues.planType,
            useCase: formValues.usAppToPersonUsecase,
          };
        } catch (error) {
          throw new HttpException(
            `Request to Fetch Number Sid and associating Number to comapign not success: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
  }

  fetchBrandStatus = async (context: RequestContext, brandId: string): Promise<any> => {
    const { logger, correlationId } = context;
    try {
      const brandStatus = await this.twilioClient.messaging.v1.brandRegistrations(brandId).fetch();
      return brandStatus;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Fetch Brand Status error',
        error,
      });
      throw new HttpException('Request to Fetch Brand Status not success', HttpStatus.BAD_REQUEST);
      // throw new IllegalStateException('Request to Fetch Brand Status not success');
    }
  };

  createA2pCompaign = async (
    context: RequestContext,
    messageServiceSid: string,
    brandSid: string,
    desc: string,
    MessageFlow: string,
    MessageSamples: string[],
    UsAppToPersonUsecase: string,
  ): Promise<any> => {
    const { logger, correlationId } = context;
    try {
      const config: any = {
        method: 'post',
        url: `https://messaging.twilio.com/v1/Services/${messageServiceSid}/Compliance/Usa2p`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.configService.twilioAccountSid,
          password: this.configService.twilioAuthToken,
        },
        data: QueryString.stringify({
          HasEmbeddedPhone: true,
          Description: desc,
          MessageFlow,
          MessageSamples: `${MessageSamples[0]},${MessageSamples[1]}`,
          UsAppToPersonUsecase,
          HasEmbeddedLinks: true,
          BrandRegistrationSid: brandSid,
        }),
      };

      const { data } = await this.httpService.axiosRef(config);
      return data;
    } catch (error) {
      // console.log('error', error);
      console.log(`error for ${context.user.email}`, error.response.data);
      logger.error({
        correlationId,
        message: 'Request Create A2p Compaign error',
        error,
      });
      // TODO: HTTPException
      throw new HttpException(
        {
          error: 'Request to Create A2p Compaign not success',
          message: `${error.response.data.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  fetchCampaignStatus = async (context: RequestContext, msgServiceSid: string): Promise<any> => {
    const { logger, correlationId } = context;
    try {
      const config: any = {
        method: 'get',
        url: `https://messaging.twilio.com/v1/Services/${msgServiceSid}/Compliance/Usa2p/QE2c6890da8086d771620e9b13fadeba0b`,
        auth: {
          username: this.configService.twilioAccountSid,
          password: this.configService.twilioAuthToken,
        },
      };

      const campaign = await this.httpService
        .axiosRef(config)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err.response.data);
        });

      return campaign;
    } catch (error) {
      console.log('error', error);
      console.log('error', error.data);
      logger.error({
        correlationId,
        message: 'Request Create A2p Compaign error',
        error,
      });
      // TODO: HTTPException
      throw new HttpException('Request to Create A2p Compaign not success', HttpStatus.BAD_REQUEST);
      // throw new IllegalStateException('Request to Create A2p Compaign not success');
    }
  };

  addPhoneNumberToMessageingService = async (
    context: RequestContext,
    messageServiceSid: string,
    phoneNumberSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const phone = await this.twilioClient.messaging.v1
        .services(messageServiceSid)
        .phoneNumbers.create({
          phoneNumberSid,
        });

      return phone;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Add Phone Number To Messageing Service error',
        error,
      });

      throw new HttpException(
        'Request to Add Phone Number To Messageing Service not success',
        HttpStatus.BAD_REQUEST,
      );
    }
  };

  updateAnA2pBrand = async (context: RequestContext, brandId: string) => {
    const { logger, correlationId } = context;
    try {
      const brand = await this.twilioClient.messaging.v1.brandRegistrations(brandId).update();
      return brand;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Update An A2p Brand error',
        error,
      });
      throw new HttpException('Request to Update An A2p Brand not success', HttpStatus.BAD_REQUEST);
      // throw new IllegalStateException('Request to Update An A2p Brand not success');
    }
  };
}
