/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import {
  ContactImportHistory,
  ContactImportHistoryDocument,
} from '../contact.import.history.schema';

@Injectable()
export class HistoryImportContactGetByUserIdAction {
  constructor(
    @InjectModel(ContactImportHistory.name)
    private HistoryImportContactDocument: Model<ContactImportHistoryDocument>,
  ) {}

  async execute(context: RequestContext): Promise<ContactImportHistoryDocument[]> {
    return this.HistoryImportContactDocument.find({
      createdBy: context.user.id,
    });
  }
}
