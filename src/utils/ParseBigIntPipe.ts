import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class TranformObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Id is not format ObjectId');
    }
    return value;
  }
}
