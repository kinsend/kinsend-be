import { Injectable } from '@nestjs/common';
import {
  AmplifyClient,
  GetDomainAssociationCommand,
  SubDomainSetting,
  UpdateDomainAssociationCommand,
} from '@aws-sdk/client-amplify';

import { ConfigService } from '../../configs/config.service';
import { InternalServerErrorException } from '../../utils/exceptions/InternalServerErrorException';
import { RequestContext } from '../../utils/RequestContext';

@Injectable()
export class AmplifyClientService {
  private readonly amplifyClient: AmplifyClient;

  constructor(private readonly configService: ConfigService) {
    this.amplifyClient = new AmplifyClient({ region: this.configService.awsRegion });
  }

  private async getsubDomainSettingDomainAssociation(
    appId: string,
    domainName: string,
  ): Promise<SubDomainSetting[]> {
    const command = new GetDomainAssociationCommand({
      appId,
      domainName,
    });

    const response = await this.amplifyClient.send(command);
    if (!response.domainAssociation?.subDomains) {
      return [];
    }
    return response.domainAssociation.subDomains.map((sub) => {
      const subResponse: SubDomainSetting = sub.subDomainSetting as SubDomainSetting;
      if (!subResponse.prefix) {
        subResponse.prefix = '';
      }
      return subResponse;
    });
  }

  async updateAwsSubDomain(context: RequestContext, subDomain: SubDomainSetting[]) {
    const { logger, correlationId } = context;
    try {
      const command = new UpdateDomainAssociationCommand({
        appId: this.configService.amplifyAppId,
        domainName: this.configService.domain,
        subDomainSettings: subDomain,
      });
      const response = await this.amplifyClient.send(command);
      logger.info('Update subDomain setting successfull', {
        correlationId,
        response,
      });
    } catch (error) {
      logger.info('Update subDomain setting fail', {
        correlationId,
        error,
      });
      throw new InternalServerErrorException('Update subDomain setting error', error);
    }
  }

  async createSubDomain(context: RequestContext, newSubDomain: string): Promise<void> {
    const { logger, correlationId } = context;
    const { amplifyAppId, domain, amplifyBrand } = this.configService;
    const subDomain = await this.getsubDomainSettingDomainAssociation(amplifyAppId, domain);
    subDomain.push({
      branchName: amplifyBrand,
      prefix: newSubDomain,
    });
    await this.updateAwsSubDomain(context, subDomain);
    logger.info('Create subDomain setting successful', {
      correlationId,
      domain,
      newSubDomain,
    });
  }

  async replaceSubDomain(
    context: RequestContext,
    oldSubDomain,
    newSubDomain: string,
  ): Promise<void> {
    const { logger, correlationId } = context;
    const { amplifyAppId, domain, amplifyBrand } = this.configService;

    const subDomain = await this.getsubDomainSettingDomainAssociation(amplifyAppId, domain);
    const filterDomain = subDomain.map((sub) =>
      sub.prefix !== oldSubDomain
        ? sub
        : {
            branchName: amplifyBrand,
            prefix: newSubDomain,
          },
    );
    await this.updateAwsSubDomain(context, filterDomain);
    logger.info('Delete subDomain setting successful', {
      correlationId,
      domain,
      oldSubDomain,
      newSubDomain,
    });
  }

  async deleteSubDomain(context: RequestContext, sub: string): Promise<void> {
    const { logger, correlationId } = context;
    const { amplifyAppId, domain } = this.configService;

    const subDomain = await this.getsubDomainSettingDomainAssociation(amplifyAppId, domain);
    const filterDomain = subDomain.filter((subItem) => subItem.prefix !== sub);
    await this.updateAwsSubDomain(context, filterDomain);
    logger.info('Delete subDomain setting successful', {
      correlationId,
      domain,
      subDomainDelete: sub,
    });
  }
}
