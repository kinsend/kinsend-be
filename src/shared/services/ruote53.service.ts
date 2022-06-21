import { Injectable } from '@nestjs/common';
import { Route53Client, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import { ConfigService } from '../../configs/config.service';
import { InternalServerErrorException } from '../../utils/exceptions/InternalServerErrorException';
import { RequestContext } from '../../utils/RequestContext';
import { TTL } from '../../domain/const';

@Injectable()
export class Route53Service {
  private readonly route53Client: Route53Client;

  constructor(private readonly configService: ConfigService) {
    this.route53Client = new Route53Client({ region: this.configService.awsRegion });
  }

  async createSubDomain(
    context: RequestContext,
    hostedZoneId: string,
    subDomainName: string,
    domainName: string,
  ): Promise<void> {
    const { logger, correlationId } = context;
    try {
      const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'CREATE',
              ResourceRecordSet: {
                Name: subDomainName,
                Type: 'CNAME',
                ResourceRecords: [
                  {
                    Value: domainName,
                  },
                ],
                TTL,
              },
            },
          ],
        },
      });
      const response = await this.route53Client.send(command);
      logger.info('Create subdomain successfull', {
        correlationId,
        response,
      });
    } catch (error) {
      logger.info('Create subdomain fail', {
        correlationId,
        error,
      });
      throw new InternalServerErrorException('Create subdomain error', error);
    }
  }

  async deleteSubDomain(
    context: RequestContext,
    hostedZoneId: string,
    subDomainName: string,
    domainName: string,
  ): Promise<void> {
    const { logger, correlationId } = context;
    try {
      const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'DELETE',
              ResourceRecordSet: {
                Name: subDomainName,
                Type: 'CNAME',
                ResourceRecords: [
                  {
                    Value: domainName,
                  },
                ],
                TTL,
              },
            },
          ],
        },
      });
      const response = await this.route53Client.send(command);
      logger.info('Delete subdomain successfull', {
        correlationId,
        response,
      });
    } catch (error) {
      logger.info('Delete subdomain failed', {
        correlationId,
        error,
      });
      throw new InternalServerErrorException('Delete subdomain error', error);
    }
  }
}
