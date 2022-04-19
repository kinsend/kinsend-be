import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: debugMessage,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
