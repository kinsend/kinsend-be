/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { ContactImportHistoryCreatePayload } from '../dtos/ContactImportHistoryCreatePayload.dto';
import {
  ContactImportHistory,
  ContactImportHistoryDocument,
} from '../contact.import.history.schema';

@Injectable()
export class ContactImportHistoryCreateAction {
  constructor(
    @InjectModel(ContactImportHistory.name)
    private HistoryImportContactDocument: Model<ContactImportHistoryDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: ContactImportHistoryCreatePayload,
  ): Promise<ContactImportHistoryDocument> {
    return new this.HistoryImportContactDocument({
      ...payload,
      createdBy: context.user.id,
    }).save();
  }
}
