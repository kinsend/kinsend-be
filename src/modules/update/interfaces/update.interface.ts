import { UpdateDocument } from '../update.schema';
import { UpdateReportingDocument } from '../update.reporting.schema';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';

export type UpdateGetByIdResponseQuery = UpdateDocument & {
  reporting: UpdateReportingDocument;
};

export type Subscriber = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: PhoneNumber;
};

export type Clicked = {
  link: string;
  clicked: Subscriber[];
  unClicked: Subscriber[];
};
export type UpdateGetByIdResponse = UpdateDocument & {
  reporting: {
    responsePercent: number;
    deliveredPercent: number;
    bouncedPercent: number;
    cleanedPercent: number;
    deliveredSMSPercent: number;
    deliveredMMSPercent: number;
    domesticPercent: number;
    internationalPercent: number;
    optedOut: number;
    recipients: number;
    responded: Subscriber[];
    notResponse: Subscriber[];
    clicked: FormSubmissionDocument[];
    notClicked: FormSubmissionDocument[];
    deliveredNumbers: number;
    deliveredBySms: number;
    deliveredByMms: number;
    byLocal: number;
    byInternational: number;
    optedOutResponded: number;
    linkNumbers: number;
    bounced: number;
    cleaned: number;
    clickedPercent: number;
  };
};
