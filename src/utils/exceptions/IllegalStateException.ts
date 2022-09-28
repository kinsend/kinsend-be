import { HttpException, HttpStatus } from '@nestjs/common';

export class IllegalStateException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: debugMessage,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
