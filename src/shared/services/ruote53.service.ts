import { Injectable } from '@nestjs/common';
import { Route53Client, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import { ConfigService } from '../../configs/config.service';
import { InternalServerErrorException } from '../../utils/exceptions/InternalServerErrorException';

@Injectable()
export class Route53Service {
  private readonly route53Client: Route53Client;

  constructor(private readonly configService: ConfigService) {
    this.route53Client = new Route53Client({ region: this.configService.awsRegion });
  }

  async createSubDomain(
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
      await this.route53Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Create subdomain error', error);
    }
  }

  async deleteSubDomain(
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
      await this.route53Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Create subdomain error', error);
    }
  }
}
