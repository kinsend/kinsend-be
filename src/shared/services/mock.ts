import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

const dateMock =  new Date("2015-07-30T20:00:00Z");
export const verifyInstaceMockResponse = {
  "sid": "VEXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXX",
  "to": "+15017122661",
  "channel": "sms",
  "status": "pending",
  "valid": false,
  "lookup": {},
  "amount": "1",
  "accountSid":"VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "dateCreated":dateMock,
  "dateUpdated":new Date("2015-07-30T20:00:00Z"),
  "payee": "",
  "serviceSid":"",
  "sendCodeAttempts":[
    {
      "time": "2015-07-30T20:00:00Z",
      "channel": "SMS",
      "attempt_sid": "VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  ],
  "url": "https://verify.twilio.com/v2/Services/VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Verifications/VEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
} as VerificationInstance
