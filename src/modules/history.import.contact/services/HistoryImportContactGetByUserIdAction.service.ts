/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { HistoryImportContactCreatePayload } from '../dtos/HistoryImportContactCreatePayload.dto';
import {
  HistoryImportContact,
  HistoryImportContactDocument,
} from '../history.import.contact.schema';

@Injectable()
export class HistoryImportContactGetByUserIdAction {
  constructor(
    @InjectModel(HistoryImportContact.name)
    private HistoryImportContactDocument: Model<HistoryImportContactDocument>,
  ) {}

  async execute(context: RequestContext): Promise<HistoryImportContactDocument[]> {
    return this.HistoryImportContactDocument.find({
      createdBy: context.user.id,
    });
  }
}
