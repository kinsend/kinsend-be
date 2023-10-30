/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { A2pRegistration, A2pRegistrationDocument } from '../a2p-registration.schema';

@Injectable()
export class A2p10dlcGetByUserIdAction {
  constructor(
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
  ) {}

  async execute(context: RequestContext, userId: string): Promise<A2pRegistrationDocument> {
    const a2pRegistration = await this.a2pRegistration.findOne({ userId });
    if (!a2pRegistration) {
      throw new NotFoundException('A2pRegistration', 'A2pRegistration not found');
    }
    return a2pRegistration;
  }
}
