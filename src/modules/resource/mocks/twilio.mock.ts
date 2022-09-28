import { TollFreeInstance } from 'twilio/lib/rest/api/v2010/account/availablePhoneNumber/tollFree';
import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';

const dateMock = new Date('2015-07-30T20:00:00Z');
export const verifyInstaceMockResponse = {
  sid: 'VEXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXX',
  to: '+15017122661',
  channel: 'sms',
  status: 'pending',
  valid: false,
  lookup: {},
  amount: '1',
  accountSid: 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  dateCreated: dateMock,
  dateUpdated: new Date('2015-07-30T20:00:00Z'),
  payee: '',
  serviceSid: '',
  sendCodeAttempts: [
    {
      time: '2015-07-30T20:00:00Z',
      channel: 'SMS',
      attempt_sid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    },
  ],
  url: 'https://verify.twilio.com/v2/Services/VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Verifications/VEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
} as VerificationInstance;

export const availablePhoneNumberMockResponse = {
  addressRequirements: 'none',
  beta: false,
  capabilities: {
    mms: true,
    sms: true,
    voice: true,
    fax: true,
  },
  friendlyName: '(800) 100-0052',
  isoCountry: 'US',
  lata: '',
  latitude: 1,
  locality: '',
  longitude: 1,
  phoneNumber: '+18001000052',
  postalCode: '',
  rateCenter: '',
  region: '',
} as TollFreeInstance;
