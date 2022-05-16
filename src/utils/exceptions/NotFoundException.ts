import { HttpException, HttpStatus } from '@nestjs/common';

export type NotFoundResourceTypes = 'User' | 'Admin' | 'Accountant' | 'Permission' | 'Payment' | "File" | "Image" | "VCard";
export class NotFoundException extends HttpException {
  constructor(resourceType: NotFoundResourceTypes, debugMessage: string) {
    super(
      {
        resource: resourceType,
        statusCode: HttpStatus.NOT_FOUND,
        message: debugMessage,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
