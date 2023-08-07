/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
/* eslint-disable unicorn/prevent-abbreviations */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from 'src/configs/config.service';
import { RequestContext } from 'src/utils/RequestContext';
import { IllegalStateException } from 'src/utils/exceptions/IllegalStateException';
import { Twilio } from 'twilio';
import { A2pRegistration, A2pRegistrationDocument } from '../a2p-registration.schema';

@Injectable()
export class A2pRegistrationTrustHubService {
  private twilioClient: Twilio;

  constructor(
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
    private readonly configService: ConfigService,
  ) {
    const { twilioAccountSid, twilioAuthToken } = this.configService;
    this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
  }

  async execute(context: any, payload: any): Promise<any> {
    // console.log('context =============', context);
    // console.log('payload =============', payload);
    // return {};
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      business_type,
      business_industry,
      businessRegistrationNumber,
      business_regions_of_operation,
      businessTitle,
      jobPosition,
      street,
      city,
      region,
      postalCode,
      business_name,
      websiteUrl,
      isoCountryCode,
      customerEmail,
      companyType,
      stockExchange,
      stockTicker,
      description,
      messageFlow,
      messageSample,
      usAppToPersonUsecase,
      name,
    } = payload;
    // const a2pRegistration = await this.a2pRegistration.find();
    // return a2pRegistration;

    // Create an empty secondary customer profile bundle (1.2)
    const emptySecCustomer = await this.createEmptySecCustomerProfile(context, customerEmail);
    // Create end-user object of type (1.3)
    const endUserObject = await this.createEndUserObject(
      context,
      business_regions_of_operation,
      business_type,
      businessRegistrationNumber,
      business_industry,
      business_name,
      websiteUrl,
    );
    // Create End User Of Type Auth (1.4)
    const endUserObjectAuth = await this.createEndUserOfTypeAuth(
      context,
      phoneNumber,
      jobPosition,
      lastName,
      firstName,
      email,
      businessTitle,
    );
    // Create End User Supporting Document (1.6)
    // const fullName = `${firstName} ${lastName}`;
    // const fullName = name;
    const endUserSupportingDocument = await this.createSupportingDocument(
      context,
      name,
      street,
      city,
      region,
      postalCode,
      isoCountryCode,
    );
    // Create Customer Document (1.6.1)
    const addressSid = endUserSupportingDocument.sid;
    const customerDocument = await this.createCustomerDocument(context, addressSid);

    // Assign End User To  Empty secondary Customer profile that is created (1.7)
    const authSid = endUserObjectAuth.sid;
    // const supportingDocSid = endUserSupportingDocument.sid;
    const supportingDocSid = customerDocument.sid;
    const customerProfileInfoSid = endUserObject.sid;
    const emptySecCustomerSid = emptySecCustomer.sid;

    const assignedValues = await this.assignEndUserObjectToCustomerProfile(
      context,
      emptySecCustomerSid,
      { authSid, supportingDocSid, customerProfileInfoSid },
    );
    // Evalute the assigned values (1.8)
    const secondaryCustomerSid = assignedValues.customerProfileSid;
    const evaluationResult = await this.runEvaluation(context, secondaryCustomerSid);
    console.log('evaluationResult', evaluationResult);
    if (evaluationResult.status !== 'compliant') {
      console.log('not equal to complaint true');
      return evaluationResult;
    }
    // Submit customer profile for review (1.9)
    const submittedCustomerProfile = await this.submitSecCustomerProfile(
      context,
      secondaryCustomerSid,
    );

    console.log('submittedCustomerProfile =============', submittedCustomerProfile);
    // return submittedCustomerProfile;

    // CREATE AN A2P TRUST PRODUCT

    // Create an empty A2P trust Bundle (2.2)
    const a2pEmptyTrustBundle = await this.createEmptyA2pTrustBundle(context, customerEmail);
    console.log('a2pEmptyTrustBundle', a2pEmptyTrustBundle);
    // Create an End User of type us_a2p_msg_profile_info (2.3.1 - 2.3.4)
    const attributes = {
      business_name,
      // social_media_profile_urls: '@acme_biz',
      website_url: websiteUrl,
      business_regions_of_operation: business_regions_of_operation.split(' ').join('_'),
      business_type,
      business_registration_identifier: businessRegistrationNumber.identifier,
      business_identity: 'direct_customer',
      business_industry,
      business_registration_number: businessRegistrationNumber.number,
    };
    const endUserObjectA2p = await this.createEndUserTypeUsA2pMsgProfileInfo(
      context,
      companyType,
      stockExchange,
      stockTicker,
      attributes,
    );
    console.log('endUserObjectA2p', endUserObjectA2p);
    // Assign end user to A2P Trust Bundle (2.4)
    const trustBundleSid = a2pEmptyTrustBundle.sid;
    const endUserObjectSid = endUserObjectA2p.sid;

    const assignedEndUserToA2pTrustBundle = await this.assignEndUserObjectToA2pTrustBundle(
      context,
      trustBundleSid,
      endUserObjectSid,
    );
    console.log('assignedEndUserToA2pTrustBundle', assignedEndUserToA2pTrustBundle);
    // Assign secondary customer profile to A2P Trust Bundle (2.5)
    const assignedSecCustomerToA2pTrustBundleRes =
      await this.assignSecondaryCustomerProfileToA2pTrustBundle(
        context,
        trustBundleSid,
        secondaryCustomerSid,
      );

    console.log('assignedSecCustomerToA2pTrustBundleRes', assignedSecCustomerToA2pTrustBundleRes);

    // Run evaluation on A2P Trust Bundle (2.6)
    const a2pTrustProductEvaluation = await this.runA2pTrustEvaluation(context, trustBundleSid);
    console.log('a2pTrustProductEvaluation ************', a2pTrustProductEvaluation);
    return a2pTrustProductEvaluation;
    // Submit A2P Trust Bundle for review (2.7)
    const submittedA2pTrustBundle = await this.submitA2pTrustBundle(context, trustBundleSid);

    // CREATE AN A2P BRAND

    // create an empty A2P Brand Bundle (3)
    const createA2pBrandRes = await this.createA2pBrand(
      context,
      emptySecCustomerSid,
      trustBundleSid,
    );

    // fetch to check the brand status (3.0.1)
    const brandSid = createA2pBrandRes.sid;
    const brandStatus = await this.fetchToCheckBrandStatus(context, brandSid);

    // CREATE A MESSAGEING SERVICE
    // (4.1)
    const createdMessagingService = await this.createNewMessagingService(context);

    // CREATE AN A2P CAMPAIGN (5)

    // Fetch possible A2P Campaigns use cases (5.1)
    const possibleA2pCampaigns = await this.fetchA2pCompaignUsecases(
      context,
      createdMessagingService.sid,
      brandSid,
    );

    // create A2P Campaign (5.2)
    const createA2pCampaignRes = await this.createA2pCompaign(
      context,
      createdMessagingService.sid,
      brandSid,
      description,
      messageFlow,
      messageSample,
      usAppToPersonUsecase,
    );

    return { message: 'Hello World!' };
  }

  createEmptySecCustomerProfile = async (context: RequestContext, email: string) => {
    const { logger, correlationId } = context;
    try {
      const customerProfile = await this.twilioClient.trusthub.v1.customerProfiles.create({
        friendlyName: 'Secondary Customer Profile',
        email,
        policySid: this.configService.twilioPolicySid,
      });

      return customerProfile;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create an empty secondary customer profile bundle error',
        error,
      });

      throw new IllegalStateException(
        'Request to Create an empty secondary customer profile bundle not success',
      );
    }
  };

  createEndUserObject = async (
    context: RequestContext,
    businessRegionsOfOperation: string,
    businessType: string,
    businessRegistrationNumber: any,
    businessIndustry: string,
    businessName: string,
    websiteUrl: string,
  ) => {
    const { logger, correlationId } = context;
    console.log(
      'Business Info:',
      businessRegionsOfOperation,
      businessType,
      businessRegistrationNumber,
      businessIndustry,
      businessName,
      websiteUrl,
    );
    try {
      const attributes = {
        business_name: businessName,
        // social_media_profile_urls: '@acme_biz',
        website_url: websiteUrl,
        business_regions_of_operation: businessRegionsOfOperation.split(' ').join('_'),
        business_type: businessType,
        business_registration_identifier: businessRegistrationNumber.identifier,
        business_identity: 'direct_customer',
        business_industry: businessIndustry,
        business_registration_number: businessRegistrationNumber.number,
      };
      const endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
        friendlyName: 'End User Object',
        type: 'customer_profile_business_information',
        attributes,
      });

      return endUserObject;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create end user object error',
        error,
      });

      throw new IllegalStateException('Request to Create Create end user object not success');
    }
  };

  createEndUserOfTypeAuth = async (
    context: RequestContext,
    phoneNumber: any,
    jobPosition: string,
    lastName: string,
    firstName: string,
    email: string,
    businessTitle: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const attributes = {
        job_position: jobPosition,
        last_name: lastName,
        phone_number: `+1${phoneNumber.phone}`,
        first_name: firstName,
        email,
        business_title: businessTitle,
      };

      const endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
        friendlyName: 'End User Object',
        type: 'authorized_representative_1',
        attributes,
      });

      return endUserObject;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create end user of type Authorized error',
        error,
      });

      throw new IllegalStateException('Request to Create end user of type Authorized not success');
    }
  };

  createSupportingDocument = async (
    context: RequestContext,
    customerName: string,
    street: string,
    city: string,
    region: string,
    postalCode: string,
    isoCountry: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const supportingDocument = await this.twilioClient.addresses.create({
        customerName,
        street,
        city,
        region,
        postalCode,
        isoCountry,
      });

      return supportingDocument;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create supporting document error',
        error,
      });

      throw new IllegalStateException('Request to Create supporting document not success');
    }
  };

  createCustomerDocument = async (context: RequestContext, addressSid: string) => {
    const { logger, correlationId } = context;
    try {
      const customerDocument = await this.twilioClient.trusthub.v1.supportingDocuments.create({
        attributes: { address_sids: addressSid },
        type: 'customer_profile_address',
        friendlyName: 'Customer Document',
      });

      return customerDocument;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create customer document error',
        error,
      });

      throw new IllegalStateException('Request to Create customer document not success');
    }
  };

  assignEndUserObjectToCustomerProfile = async (
    context: RequestContext,
    bundleSid: string,
    sids: any,
  ) => {
    const { logger, correlationId } = context;
    try {
      // Assign End User Authorized Representative 1
      const authRes = await this.assignCustomerDetailThroughSid(context, bundleSid, sids.authSid);
      console.log('authRes', authRes);
      // Assign End User Supporting Document
      const supportingDocRes = await this.assignCustomerDetailThroughSid(
        context,
        bundleSid,
        sids.supportingDocSid,
      );
      console.log('supportingDocRes', supportingDocRes);

      // Assign End User Customer Profile Business Info
      const customerProfileInfoRes = await this.assignCustomerDetailThroughSid(
        context,
        bundleSid,
        sids.customerProfileInfoSid,
      );
      console.log('customerProfileInfoRes', customerProfileInfoRes);
      // Assign End User Primary Customer Profile
      const assignedValuesRes = await this.assignCustomerDetailThroughSid(
        context,
        bundleSid,
        // customerProfileInfoRes.sid,
        this.configService.twilioPrimaryProfileSid,
      );

      return assignedValuesRes;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Assign End User Object error',
        error,
      });

      throw new IllegalStateException('Request to Assign End User Object not success');
    }
  };

  assignCustomerDetailThroughSid = async (
    context: RequestContext,
    bundleSid: string,
    sid: string,
  ) => {
    const { logger, correlationId } = context;
    console.log('sid ==== ', sid, bundleSid);
    try {
      const customerProfile = await this.twilioClient.trusthub.v1
        .customerProfiles(bundleSid)
        .customerProfilesEntityAssignments.create({ objectSid: sid });

      return customerProfile;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Assign Customer Detail Single Call error',
        error,
      });

      throw new IllegalStateException('Request to Assign Customer Detail Single Call not success');
    }
  };

  runEvaluation = async (context: RequestContext, customerProfileSid: string) => {
    const { logger, correlationId } = context;
    try {
      const evaluation = await this.twilioClient.trusthub.v1
        .customerProfiles(customerProfileSid)
        .customerProfilesEvaluations.create({ policySid: this.configService.twilioPolicySid });

      return evaluation;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Run Evaluation error',
        error,
      });

      throw new IllegalStateException('Request to Run Evaluation not success');
    }
  };

  submitSecCustomerProfile = async (context: RequestContext, customerProfileSid: string) => {
    const { logger, correlationId } = context;
    try {
      const submit = await this.twilioClient.trusthub.v1
        .customerProfiles(customerProfileSid)
        .update({ status: 'pending-review' });

      return submit;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Submit Secondary Customer Profile error',
        error,
      });

      throw new IllegalStateException('Request to Submit Secondary Customer Profile not success');
    }
  };

  // CREATE AN A2P TRUST PRODUCT

  createEmptyA2pTrustBundle = async (context: RequestContext, customerEmail: string) => {
    const { logger, correlationId } = context;
    try {
      const bundle = await this.twilioClient.trusthub.v1.trustProducts.create({
        friendlyName: 'A2P Trust Bundle',
        email: customerEmail,
        policySid: this.configService.twilioPolicySid,
      });

      return bundle;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Create Empty A2P Trust Bundle error',
        error,
      });

      throw new IllegalStateException('Request to Create Empty A2P Trust Bundle not success');
    }
  };

  createEndUserTypeUsA2pMsgProfileInfo = async (
    context: RequestContext,
    companyType: string,
    stockExchange: string,
    stockTicker: string,
    attributes: any,
  ) => {
    const { logger, correlationId } = context;
    console.log('attributes', attributes);
    try {
      let endUserObject;
      switch (companyType) {
        case 'public': {
          endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
            attributes: {
              company_type: companyType,
              stock_exchange: stockExchange,
              stock_ticker: stockTicker,
              // ...attributes,
            },
            friendlyName: 'End User Type US A2P Messaging Profile Info',
            type: 'us_a2p_messaging_profile_information',
          });

          break;
        }
        case 'private': {
          endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
            attributes: {
              company_type: companyType,
              // ...attributes,
            },
            friendlyName: 'End User Type US A2P Messaging Profile Info',
            type: 'us_a2p_messaging_profile_information',
          });

          break;
        }
        case 'non-profit': {
          endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
            attributes: {
              company_type: companyType,
              // ...attributes,
            },
            friendlyName: 'End User Type US A2P Messaging Profile Info',
            type: 'us_a2p_messaging_profile_information',
          });

          break;
        }
        default: {
          // For companyType = Government
          endUserObject = await this.twilioClient.trusthub.v1.endUsers.create({
            attributes: {
              company_type: companyType,
              // ...attributes,
            },
            friendlyName: 'End User Type US A2P Messaging Profile Info',
            type: 'us_a2p_messaging_profile_information',
          });
        }
      }

      return endUserObject;
    } catch (error) {
      console.log('error -------- ', error);
      logger.error({
        correlationId,
        message: 'Request Create end user of type Authorized error',
        error,
      });

      throw new IllegalStateException('Request to Create end user of type Authorized not success');
    }
  };

  assignEndUserObjectToA2pTrustBundle = async (
    context: RequestContext,
    bundleSid: string,
    objectSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const endUserObject = await this.twilioClient.trusthub.v1
        .trustProducts(bundleSid)
        .trustProductsEntityAssignments.create({ objectSid });

      return endUserObject;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Assign End User Object to A2P Trust Bundle error',
        error,
      });

      throw new IllegalStateException(
        'Request to Assign End User Object to A2P Trust Bundle not success',
      );
    }
  };

  assignSecondaryCustomerProfileToA2pTrustBundle = async (
    context: RequestContext,
    trustBundleSid: string,
    objectSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const customerProfile = await this.twilioClient.trusthub.v1
        .trustProducts(trustBundleSid)
        .trustProductsEntityAssignments.create({ objectSid });

      return customerProfile;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Assign Secondary Customer Profile to A2P Trust Bundle error',
        error,
      });

      throw new IllegalStateException(
        'Request to Assign Secondary Customer Profile to A2P Trust Bundle not success',
      );
    }
  };

  runA2pTrustEvaluation = async (context: RequestContext, trustBundleSid: string) => {
    const { logger, correlationId } = context;
    try {
      const evaluation = await this.twilioClient.trusthub.v1
        .trustProducts(trustBundleSid)
        .trustProductsEvaluations.create({ policySid: this.configService.twilioPolicySid });

      return evaluation;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Run A2P Trust Evaluation error',
        error,
      });

      throw new IllegalStateException('Request to Run A2P Trust Evaluation not success');
    }
  };

  submitA2pTrustBundle = async (context: RequestContext, trustBundleSid: string) => {
    const { logger, correlationId } = context;
    try {
      const submit = await this.twilioClient.trusthub.v1
        .trustProducts(trustBundleSid)
        .update({ status: 'pending-review' });

      return submit;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Submit A2P Trust Bundle error',
        error,
      });

      throw new IllegalStateException('Request to Submit A2P Trust Bundle not success');
    }
  };

  // CREATE AN A2P BRAND

  createA2pBrand = async (
    context: RequestContext,
    customerProfileBundleSid: string,
    a2PProfileBundleSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const brand = await this.twilioClient.messaging.v1.brandRegistrations.create({
        skipAutomaticSecVet: true,
        customerProfileBundleSid,
        a2PProfileBundleSid,
      });

      return brand;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Create A2P Brand error',
        error,
      });

      throw new IllegalStateException('Request to Create A2P Brand not success');
    }
  };

  fetchToCheckBrandStatus = async (context: RequestContext, brandSid: string) => {
    const { logger, correlationId } = context;
    try {
      const brand = await this.twilioClient.messaging.v1.brandRegistrations(brandSid).fetch();

      return brand;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Fetch To Check Brand Status error',
        error,
      });

      throw new IllegalStateException('Request to Fetch To Check Brand Status not success');
    }
  };

  importCampaignVerifyId = async (
    context: RequestContext,
    brand_sid: string,
    vettingId: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const campaign = await this.twilioClient.messaging.v1
        .brandRegistrations(brand_sid)
        .brandVettings.create({
          vettingId,
          vettingProvider: 'campaign-verify',
        });

      return campaign;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Import Campaign Verify Id error',
        error,
      });

      throw new IllegalStateException('Request to Import Campaign Verify Id not success');
    }
  };

  fetchAllExternalVettingRecords = async (context: RequestContext, brandSid: string) => {
    const { logger, correlationId } = context;
    try {
      const vettingRecords = await this.twilioClient.messaging.v1
        .brandRegistrations(brandSid)
        .brandVettings.list({ limit: 20 });

      return vettingRecords;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Fetch All External Vetting Records error',
        error,
      });

      throw new IllegalStateException('Request to Fetch All External Vetting Records not success');
    }
  };

  createNewMessagingService = async (context: RequestContext) => {
    const { logger, correlationId } = context;
    try {
      const messagingService = await this.twilioClient.messaging.v1.services.create({
        inboundRequestUrl: `${this.configService.backendDomain}/api/hook/sms`,
        fallbackUrl: `${this.configService.backendDomain}/api/hook/sms`,
        friendlyName: 'A2P Messaging Service',
      });

      return messagingService;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Create New Messaging Service error',
        error,
      });

      throw new IllegalStateException('Request to Create New Messaging Service not success');
    }
  };

  fetchA2pCompaignUsecases = async (
    context: RequestContext,
    messageServiceSid: string,
    brandSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const usecases = await this.twilioClient.messaging.v1
        .services(messageServiceSid)
        .usAppToPersonUsecases.fetch({
          brandRegistrationSid: brandSid,
        });

      return usecases;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Fetch A2p Compaign Usecases error',
        error,
      });

      throw new IllegalStateException('Request to Fetch A2p Compaign Usecases not success');
    }
  };

  createA2pCompaign = async (
    context: RequestContext,
    messageServiceSid: string,
    brandSid: string,
    desc: string,
    messageFlow: string,
    messageSamples: string[],
    usAppToPersonUsecase: string,
    // hasEmbeddedLinks: boolean,
    // hasPhoneNumbers: boolean,
  ) => {
    const { logger, correlationId } = context;
    try {
      const campaign = await this.twilioClient.messaging.v1
        .services(messageServiceSid)
        .usAppToPerson.create({
          // optInKeywords: ['START', 'BEGIN'],
          // optInMessage: 'Thanks for subscribing',
          description: desc,
          // messageFlow,
          messageSamples,
          usAppToPersonUsecase,
          hasEmbeddedLinks: true,
          hasEmbeddedPhone: true,
          brandRegistrationSid: brandSid,
        });

      return campaign;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Create A2p Compaign error',
        error,
      });

      throw new IllegalStateException('Request to Create A2p Compaign not success');
    }
  };

  checkA2pCompaignStatus = async (context: RequestContext, messageServiceSid: string) => {
    const { logger, correlationId } = context;
    try {
      const campaign = await this.twilioClient.messaging.v1
        .services(messageServiceSid)
        .usAppToPerson(this.configService.twilioComplianceType)
        .fetch();

      return campaign;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Check A2p Compaign Status error',
        error,
      });

      throw new IllegalStateException('Request to Check A2p Compaign Status not success');
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

      throw new IllegalStateException(
        'Request to Add Phone Number To Messageing Service not success',
      );
    }
  };

  fetchPhoneNumberResource = async (
    context: RequestContext,
    messageServiceSid: string,
    phoneNumberSid: string,
  ) => {
    const { logger, correlationId } = context;
    try {
      const phone = await this.twilioClient.messaging.v1
        .services(messageServiceSid)
        .phoneNumbers(phoneNumberSid)
        .fetch();

      return phone;
    } catch (error) {
      logger.error({
        correlationId,
        message: 'Request Fetch Phone Number Resource error',
        error,
      });

      throw new IllegalStateException('Request to Fetch Phone Number Resource not success');
    }
  };
}
