/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FirstContact, FirstContactDocument } from '../first-contact.schema'; 
import { A2pRegistration, A2pRegistrationDocument } from '@app/modules/a2p-registration/a2p-registration.schema';

@Injectable()
export class FirstContactGetAction {
  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
    @InjectModel(A2pRegistration.name) private a2pRegistration: Model<A2pRegistrationDocument>,
    ) {}

  async execute(context: RequestContext): Promise<FirstContact> {
    const { user } = context;
    let firstContact = await this.firstContactDocument.findOne({
      createdBy: user.id,
    });
    if (!firstContact) {
      firstContact = await new this.firstContactDocument({
        createdBy: user.id,
      }).save();
    }
    const userA2pInfo = await this.a2pRegistration.findOne({ userId: user.id });
    if (!userA2pInfo || userA2pInfo?.progress !== 'APPROVED') {
      firstContact.isEnable = false;
      await firstContact.save();
    }
    return (await firstContact.save()).populate(['firstTask', 'reminderTask']);
  }
}
