import { Request } from 'express';
import { Logger } from './Logger';

export interface AppRequest extends Request {
  user: any;
  correlationId: string;
  logger: Logger;
}
