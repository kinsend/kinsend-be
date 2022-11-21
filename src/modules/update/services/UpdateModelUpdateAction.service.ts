/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../../user/user.schema';
import { UpdateModelUpdatePayload } from '../dtos/UpdateModelUpdatePayload.dto';
import { UPDATE_PROGRESS } from '../interfaces/const';
import { LinkRedirect, LinkRedirectDocument } from '../link.redirect.schema';
import { UpdateSchedule, UpdateScheduleDocument } from '../update.schedule.schema';
import { UpdateDocument } from '../update.schema';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateFindByIdWithoutReportingAction } from './UpdateFindByIdWithoutReportingAction.service';
import { UpdateHandleTrigerAction } from './UpdateHandleTrigerAction';

@Injectable()
export class UpdateModelUpdateAction {
  constructor(
    @InjectModel(LinkRedirect.name) private linkRedirectModel: Model<LinkRedirectDocument>,
    private updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    private updateHandleTrigerAction: UpdateHandleTrigerAction,
    @InjectModel(UpdateSchedule.name) private updateScheduleModel: Model<UpdateScheduleDocument>,
  ) {}

  async execute(
    context: RequestContext,
    id: string,
    payload: UpdateModelUpdatePayload,
  ): Promise<UpdateDocument> {
    const update = await this.updateFindByIdWithoutReportingAction.execute(context, id);

    if (update.progress === UPDATE_PROGRESS.DONE) {
      throw new BadRequestException(
        'Update',
        `Unfortunately the update was scheduled for ${update.datetime}, and has already gone out to the intended subscribers.`,
      );
    }

    const { message, filter, datetime, triggerType, progress } = payload;
    if (message) {
      update.message = message;
      update.messageReview = await this.handleUpdateLinkMessage(context, update);
    }

    if (datetime) {
      update.datetime = datetime;
    }

    if (triggerType) {
      update.triggerType = triggerType;
    }

    if (filter) {
      update.filter = filter;
    }

    if (progress) {
      update.progress = progress;
    }

    const lastUpdate = new Date();
    update.updatedAt = lastUpdate;

    const response = await (
      await update.save()
    ).populate([{ path: 'createdBy', select: ['-password'] }]);
    this.updateHandleTrigerAction.execute(
      context,
      update,
      update.filter,
      lastUpdate,
      update.createdBy as UserDocument,
    );
    await this.updateScheduleModel.updateOne(
      { update: response._id },
      {
        status: UPDATE_PROGRESS.DONE,
      },
    );
    return response;
  }

  private async handleUpdateLinkMessage(context: RequestContext, update: UpdateDocument) {
    // Delete old redirectLink
    await this.linkRedirectModel.deleteMany({
      update: update.id,
    });

    // Create new redirectLink
    const linkCreated = await this.linkRediectCreateByMessageAction.execute(
      context,
      update,
      undefined,
      true,
    );
    return linkCreated.messageReview;
  }
}
