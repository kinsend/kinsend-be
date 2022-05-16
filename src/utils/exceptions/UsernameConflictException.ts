import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailConflictException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: debugMessage,
      },
      HttpStatus.CONFLICT,
    );
  }
}
