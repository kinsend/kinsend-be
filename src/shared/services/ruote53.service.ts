import { Injectable } from '@nestjs/common';
import { Route53Client, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import { ConfigService } from '../../configs/config.service';
import { InternalServerErrorException } from '../../utils/exceptions/InternalServerErrorException';
import { RequestContext } from '../../utils/RequestContext';

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
                TTL: 60,
              },
            },
          ],
        },
      });
      const response = await this.route53Client.send(command);
      context.logger.info('Create subdomain successfull', {
        requestId: context.correlationId,
        ...response,
      });
    } catch (error) {
      context.logger.info('Create subdomain fail', {
        requestId: context.correlationId,
        ...error,
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
                TTL: 60,
              },
            },
          ],
        },
      });
      const response = await this.route53Client.send(command);
      context.logger.info('Delete subdomain successfull', {
        requestId: context.correlationId,
        ...response,
      });
    } catch (error) {
      context.logger.info('Delete subdomain failed', {
        requestId: context.correlationId,
        ...error,
      });
      throw new InternalServerErrorException('Delete subdomain error', error);
    }
  }
}
