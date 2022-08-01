import { UpdateDocument } from '../update.schema';
import { UpdateReportingDocument } from '../update.reporting.schema';

export type UpdateGetByIdResponseQuery = UpdateDocument & {
  reporting: UpdateReportingDocument;
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
  };
};
