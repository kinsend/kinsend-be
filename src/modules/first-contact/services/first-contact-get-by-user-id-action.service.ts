/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FirstContact, FirstContactDocument } from '../first-contact.schema';

@Injectable()
export class FirstContactGetByUserIdAction {
  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
  ) {}

  async execute(userId: string): Promise<FirstContact | null> {
    let firstContact = await this.firstContactDocument.findOne({
      createdBy: userId,
    });
    if (!firstContact) {
      return null;
    }
    return (await firstContact.save()).populate(['firstTask', 'reminderTask']);
  }
}
