import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/providers/guards/JwtAuthGuard.provider';
import { AppRequest } from 'src/utils/AppRequest';
import { A2pRegistrationTrustHubService } from './services/a2p-registration.service';

@ApiTags('A2PRegistration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseInterceptors(MongooseClassSerializerInterceptor(KeywordResponseModule))
@Controller('api/a2p-registration')
export class A2PRegistrationController {
  constructor(private a2pRegistrationTrustHubService: A2pRegistrationTrustHubService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/trusthub')
  createTrustHub(@Req() request: AppRequest, @Body() payload: any) {
    // console.log('WORKING');
    // console.log('request =============', request);
    // console.log('payload ===============', payload);
    return this.a2pRegistrationTrustHubService.execute(request, payload);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/brand')
  createBrandRegistration(@Req() request: AppRequest, @Body() payload: any) {
    console.log('WORKING');
    console.log('request =============', request);
    console.log('payload ===============', payload);
    return this.a2pRegistrationTrustHubService.execute(request, payload);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/compaign')
  createCompaign(@Req() request: AppRequest, @Body() payload: any) {
    console.log('WORKING');
    console.log('request =============', request);
    console.log('payload ===============', payload);
    return this.a2pRegistrationTrustHubService.execute(request, payload);
  }
}
