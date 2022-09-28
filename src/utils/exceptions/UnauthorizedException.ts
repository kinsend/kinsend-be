import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(debugMessage: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: debugMessage,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
