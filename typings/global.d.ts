import { Logger } from '../src/utils/Logger';

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      correlationId: string;
    }
  }
}
