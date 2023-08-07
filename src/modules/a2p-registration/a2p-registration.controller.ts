import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/providers/guards/JwtAuthGuard.provider';
import { AppRequest } from 'src/utils/AppRequest';
import { A2pRegistrationTrustHubService } from './services/a2p-registration.service';
import { A2pBrandStatusService } from './services/a2p-brand-status.service';

@ApiTags('A2PRegistration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseInterceptors(MongooseClassSerializerInterceptor(KeywordResponseModule))
@Controller('api/a2p-registration')
export class A2PRegistrationController {
  constructor(
    private a2pRegistrationTrustHubService: A2pRegistrationTrustHubService,
    private a2pBrandStatusService: A2pBrandStatusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/trusthub')
  createTrustHub(@Req() request: AppRequest, @Body() payload: any) {
    return this.a2pRegistrationTrustHubService.execute(request, payload);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Get('/brandStatus')
  checkBrandStatus(@Req() request: AppRequest) {
    return this.a2pBrandStatusService.execute(request);
  }
}
