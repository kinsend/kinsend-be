/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FirstContact, FirstContactDocument } from '../first-contact.schema'; 

@Injectable()
export class FirstContactGetAction {
  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
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
    return (await firstContact.save()).populate(['firstTask', 'reminderTask']);
  }
}
