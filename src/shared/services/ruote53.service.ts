import { Injectable } from '@nestjs/common';
import { Stack, Construct, StackProps, ConstructNode } from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';

@Injectable()
export class Route53Service extends Stack {
  private readonly awsRoute53Client: any;

  private constructNode: ConstructNode;

  // constructor(private readonly configService: ConfigService) {
  //   this.awsRoute53Client = Route53.HostedZone;
  // }

  async createSubDomain() {
    const myDomainName = 'api.example.com';
    const certificate = new acm.Certificate(this, 'cert', { domainName: myDomainName });
    const hostedZoneId = '123';
    const zoneName = 'example.com';
    // hosted zone for adding appsync domain
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName,
    });

    // create a cname to the appsync domain. will map to something like xxxx.cloudfront.net
    const response = new route53.CnameRecord(this, 'CnameApiRecord', {
      recordName: 'api',
      zone,
      domainName: myDomainName,
    });
    // const a = new CnameRecord(this, '123', {
    //   domainName: 'hi',
    //   recordName: 'user-subdomain',
    //   zone: {
    //     zoneName: '',
    //     hostedZoneId: '',
    //     stack: this,
    //     node: this.constructNode,
    //     hostedZoneArn: 'arn:aws:route53:::hostedzone/Z148QEXAMPLE8V',
    //     env: {
    //       account: '',
    //       region: '',
    //     },
    //   },
    // });
  }
}
