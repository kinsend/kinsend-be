import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: debugMessage,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
