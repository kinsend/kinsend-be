import { Injectable } from '@nestjs/common';
import { Stack, Construct, StackProps, ConstructNode } from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';

@Injectable()
export class Route53Service extends Stack {
  private readonly awsRoute53Client: any;

  async createSubDomain() {
    const myDomainName = 'dev.kinsend.io';
    // const certificate = new acm.Certificate(this, 'cert', { domainName: myDomainName });
    const hostedZoneId = 'Z05122741BD0FFH2L9I77';
    const zoneName = 'dev.kinsend.io';
    // hosted zone for adding appsync domain
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName,
    });

    // create a cname to the appsync domain. will map to something like xxxx.cloudfront.net
    const response = new route53.CnameRecord(this, 'CnameApiRecord', {
      recordName: 'test',
      zone,
      domainName: myDomainName,
    });
    console.log('response :>>', response);
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
