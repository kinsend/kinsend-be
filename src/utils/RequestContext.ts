import { Logger } from './Logger';

export interface RequestContext {
  user: any;
  correlationId: string;
  logger: Logger;
}
