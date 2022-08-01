/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongo, { Model } from 'mongoose';
import { caculatePercent } from '../../../utils/caculatePercent';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UpdateGetByIdResponse } from '../interfaces/update.interface';
import { UpdateReportingDocument } from '../update.reporting.schema';
import { Update, UpdateDocument } from '../update.schema';
import { UpdateReportingFindByUpdateIdAction } from './update.reporting/UpdateReportingFindByUpdateIdAction.service';

@Injectable()
export class UpdateFindByIdAction {
  constructor(
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    private updateReportingFindByUpdateIdAction: UpdateReportingFindByUpdateIdAction,
  ) {}

  async execute(context: RequestContext, id: string): Promise<UpdateGetByIdResponse> {
    const update = await this.updateModel.findById(id).select('-recipients');
    if (!update) {
      throw new NotFoundException('Update', 'Update not found!');
    }
    const reporting = await (
      await this.updateReportingFindByUpdateIdAction.execute(context, id)
    ).populate([{ path: 'responded', select: ['-password'] }]);
    return this.buildResponse(update, reporting);
  }

  private buildResponse(
    update: UpdateDocument,
    reporting: UpdateReportingDocument,
  ): UpdateGetByIdResponse {
    const {
      responded,
      deliveredNumbers,
      recipients,
      bounced,
      cleaned,
      deliveredBySms,
      deliveredByMms,
      byLocal,
      byInternational,
    } = reporting;
    const responsePercent = caculatePercent(responded?.length || 0, deliveredNumbers);
    const deliveredPercent = caculatePercent(deliveredNumbers, recipients);
    const bouncedPercent = caculatePercent(bounced, recipients);
    // cleanedPercent same as Opted Out
    const cleanedPercent = caculatePercent(cleaned, recipients);
    const deliveredSMSPercent = caculatePercent(deliveredBySms, recipients);

    const deliveredMMSPercent = caculatePercent(deliveredByMms, recipients);
    const domesticPercent = caculatePercent(byLocal, recipients);
    const internationalPercent = caculatePercent(byInternational, recipients);
    reporting.$set('responsePercent', responsePercent, { strict: false });
    reporting.$set('deliveredPercent', deliveredPercent, { strict: false });
    reporting.$set('bouncedPercent', bouncedPercent, { strict: false });
    reporting.$set('cleanedPercent', cleanedPercent, { strict: false });
    reporting.$set('deliveredSMSPercent', deliveredSMSPercent, { strict: false });
    reporting.$set('deliveredMMSPercent', deliveredMMSPercent, { strict: false });
    reporting.$set('domesticPercent', domesticPercent, { strict: false });
    reporting.$set('internationalPercent', internationalPercent, { strict: false });
    reporting.$set('optedOut', cleanedPercent, { strict: false });
    update.$set('reporting', reporting, { strict: false });
    return update as UpdateGetByIdResponse;
  }
}
