import { Controller, Get, Req } from '@nestjs/common';
import { AppRequest } from '@app/utils/AppRequest';
import { HealthService } from './health.service';

@Controller('api/health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('/stripe')
  checkStripe(@Req() request: AppRequest) {
    return this.healthService.checkStripe(request);
  }

  @Get('/send-grid')
  checkSendGrid() {
    return this.healthService.checkSendGrid();
  }

  @Get('/twilio')
  checkTwilio() {
    return this.healthService.checkTwilio();
  }

  @Get('/mongodb')
  checkMongoDb() {
    return this.healthService.checkMongoDb();
  }
}
