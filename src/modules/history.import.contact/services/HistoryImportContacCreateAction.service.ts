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
export class HistoryImportContacCreateAction {
  constructor(
    @InjectModel(HistoryImportContact.name)
    private HistoryImportContactDocument: Model<HistoryImportContactDocument>,
  ) {}

  async execute(
    context: RequestContext,
    payload: HistoryImportContactCreatePayload,
  ): Promise<HistoryImportContactDocument> {
    return new this.HistoryImportContactDocument({
      ...payload,
      createdBy: context.user.id,
    }).save();
  }
}
