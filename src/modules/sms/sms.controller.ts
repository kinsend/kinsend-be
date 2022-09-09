import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from '../../app.service';

@ApiTags('Sms')
@Controller('api/sms')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendSms(): string {
    // TODO: implement
    return this.appService.getHello();
  }
}
