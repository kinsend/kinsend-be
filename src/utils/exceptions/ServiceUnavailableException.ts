import { HttpException, HttpStatus } from '@nestjs/common';

export class ServiceUnavailableException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: debugMessage,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
