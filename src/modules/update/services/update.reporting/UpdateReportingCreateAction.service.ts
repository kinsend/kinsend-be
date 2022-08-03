/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getLinksInMessage } from '../../../../utils/getLinksInMessage';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { UpdateReporting, UpdateReportingDocument } from '../../update.reporting.schema';
import { UpdateDocument } from '../../update.schema';

@Injectable()
export class UpdateReportingCreateAction {
  constructor(
    @InjectModel(UpdateReporting.name) private updateReportingModel: Model<UpdateReportingDocument>,
  ) {}

  async execute(
    context: RequestContext,
    update: UpdateDocument,
    subscribers: FormSubmission[],
  ): Promise<void> {
    const { byLocal, byInternational } = await this.calculateNumbersOfRegions(update, subscribers);
    let deliveredBySms = 0;
    let deliveredByMms = 0;
    if (update.fileUrl) {
      deliveredByMms = subscribers.length;
    } else {
      deliveredBySms = subscribers.length;
    }

    const updateReporting = await new this.updateReportingModel({
      update,
      byLocal,
      recipients: subscribers.length,
      byInternational,
      deliveredBySms,
      deliveredByMms,
      linkNumbers: getLinksInMessage(update.message).length,
    }).save();
    context.logger.info({
      message: 'Created update reporting',
      data: updateReporting,
    });
  }

  private async calculateNumbersOfRegions(
    update: UpdateDocument,
    subscribers: FormSubmission[],
  ): Promise<{ byLocal: number; byInternational: number }> {
    const owner = await update.populate(['createdBy']);
    const ownerCountry = (owner.createdBy.phoneNumber as PhoneNumber[])[0].short;
    let byLocal = 0;
    let byInternational = 0;
    subscribers.forEach((element) => {
      if (element.phoneNumber.short === ownerCountry) {
        byLocal += 1;
        return;
      }
      byInternational += 1;
    });
    return {
      byLocal,
      byInternational,
    };
  }
}
