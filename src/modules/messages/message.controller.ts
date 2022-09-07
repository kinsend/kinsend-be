import { Controller, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from 'src/utils/interceptors/MongooseClassSerializer.interceptor';
import { MessageModule } from './message.module';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('api/messages')
@UseInterceptors(MongooseClassSerializerInterceptor(MessageModule))
export class MessageController {
  constructor() {}
}
