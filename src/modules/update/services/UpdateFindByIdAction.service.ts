/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongo, { Model } from 'mongoose';
import { caculatePercent } from '../../../utils/caculatePercent';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { SegmentFindByIdAction } from '../../segment/services/SegmentFindByIdAction.service';
import { TagsGetByIdAction } from '../../tags/services/TagsGetByIdAction.service';
import { Clicked, Subscriber, UpdateGetByIdResponse } from '../interfaces/update.interface';
import { LinkRedirectDocument } from '../link.redirect.schema';
import { UpdateReportingDocument } from '../update.reporting.schema';
import { Update, UpdateDocument } from '../update.schema';
import { LinkRedirectFindIsRootdByUpdateIdAction } from './link.redirect/LinkRedirectFindIsRootdByUpdateIdAction.service';
import { UpdateReportingFindByUpdateIdWithoutErrorAction } from './update.reporting/UpdateReportingFindByUpdateIdWithoutErrorAction.service copy';

@Injectable()
export class UpdateFindByIdAction {
  constructor(
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    private updateReportingFindByUpdateIdWithoutErrorAction: UpdateReportingFindByUpdateIdWithoutErrorAction,
    private tagsGetByIdAction: TagsGetByIdAction,
    private segmentFindByIdAction: SegmentFindByIdAction,
    private linkRedirectFindIsRootdByUpdateIdAction: LinkRedirectFindIsRootdByUpdateIdAction,
  ) {}

  async execute(context: RequestContext, id: string): Promise<UpdateGetByIdResponse> {
    const update = await this.updateModel.findById(id).populate('recipients');
    if (!update) {
      throw new NotFoundException('Update', 'Update not found!');
    }
    const [reporting, rootLinkRedirect] = await Promise.all([
      this.updateReportingFindByUpdateIdWithoutErrorAction.execute(context, id),
      this.linkRedirectFindIsRootdByUpdateIdAction.execute(context, id),
    ]);
    return this.buildResponse(context, update, reporting, rootLinkRedirect);
  }

  private async buildResponse(
    context: RequestContext,
    update: UpdateDocument,
    reporting: UpdateReportingDocument | null,
    rootLinkRedirect: LinkRedirectDocument[],
  ): Promise<UpdateGetByIdResponse> {
    let reportingResponse = {
      responsePercent: 0,
      deliveredPercent: 0,
      bouncedPercent: 0,
      cleanedPercent: 0,
      deliveredSMSPercent: 0,
      deliveredMMSPercent: 0,
      domesticPercent: 0,
      internationalPercent: 0,
      optedOut: 0,
      recipients: 0,
      responded: [] as Subscriber[],
      notResponse: [] as Subscriber[],
      clicked: [] as Clicked[],
      deliveredNumbers: 0,
      deliveredBySms: 0,
      deliveredByMms: 0,
      byLocal: 0,
      byInternational: 0,
      optedOutResponded: 0,
      linkNumbers: 0,
      bounced: 0,
      cleaned: 0,
      clickedPercent: 0,
    };
    if (reporting) {
      await reporting.populate([
        { path: 'responded', select: ['-password'] },
        { path: 'clicked', select: ['-password'] },
      ]);
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
        optedOutResponded,
        linkNumbers,
      } = reporting;

      const cleanedPercent = caculatePercent(cleaned, recipients);
      const buildResponsed = this.buildResponsedResponse(
        update.recipients as FormSubmissionDocument[],
        responded,
      );
      reportingResponse = {
        responsePercent: caculatePercent(responded?.length || 0, deliveredNumbers),
        deliveredPercent: caculatePercent(deliveredNumbers, recipients),
        bouncedPercent: caculatePercent(bounced, recipients),
        cleanedPercent,
        deliveredSMSPercent: caculatePercent(deliveredBySms, recipients),
        deliveredMMSPercent: caculatePercent(deliveredByMms, recipients),
        domesticPercent: caculatePercent(byLocal, recipients),
        internationalPercent: caculatePercent(byInternational, recipients),
        optedOut: cleanedPercent,
        recipients,
        responded: buildResponsed.responsed,
        notResponse: buildResponsed.notResponse,
        clicked: this.buildClickedResponse(
          rootLinkRedirect,
          update.recipients as FormSubmissionDocument[],
        ),
        deliveredNumbers,
        deliveredBySms,
        deliveredByMms,
        byLocal,
        byInternational,
        optedOutResponded,
        linkNumbers,
        bounced,
        cleaned,
        clickedPercent: this.caculateClickedPercent(rootLinkRedirect, recipients),
      };
    }

    update.$set('reporting', reportingResponse, { strict: false });
    const filterResponse: any = update.filter;
    if (filterResponse && filterResponse.tagId) {
      const tag = await this.tagsGetByIdAction.execute(context, filterResponse.tagId as string);
      filterResponse.title = tag.name;
    }

    if (filterResponse && filterResponse.segmentId) {
      const tag = await this.segmentFindByIdAction.execute(
        context,
        filterResponse.segmentId as string,
      );
      filterResponse.title = tag.name;
    }
    update.filter = filterResponse;
    return update as UpdateGetByIdResponse;
  }

  private caculateClickedPercent(rootLinkRedirect: LinkRedirectDocument[], recipients: number) {
    let totalClicked = 0;
    rootLinkRedirect.forEach((link) => {
      totalClicked += link.clicked?.length || 0;
    });

    return caculatePercent(totalClicked, recipients);
  }

  private buildClickedResponse(
    linkRedirects: LinkRedirectDocument[],
    recipients: FormSubmissionDocument[],
  ) {
    const clickedResponse: Clicked[] = [];
    linkRedirects.forEach((link) => {
      const unClicked =
        !link.clicked || link.clicked.length === 0
          ? recipients
          : recipients.filter((rec) => link.clicked?.some((item) => item.id !== rec.id));
      const clickedItem: Clicked = {
        link: link.redirect,
        clicked: this.buildConvertSubmissionToJson(link.clicked),
        unClicked: this.buildConvertSubmissionToJson(unClicked),
      };
      clickedResponse.push(clickedItem);
    });
    return clickedResponse;
  }

  private buildResponsedResponse(
    recipients: FormSubmissionDocument[],
    responded?: FormSubmissionDocument[],
  ): { responsed: Subscriber[]; notResponse: Subscriber[] } {
    let responsed: Subscriber[] = [];
    let notResponse: Subscriber[] = [];

    if (!responded || responded.length === 0) {
      notResponse = this.buildConvertSubmissionToJson(recipients);
      return {
        responsed,
        notResponse,
      };
    }

    const notResponseFilter = recipients.filter((rec) =>
      responded.some((item) => item.id !== rec.id),
    );
    responsed = this.buildConvertSubmissionToJson(responded);
    notResponse = this.buildConvertSubmissionToJson(notResponseFilter);
    return {
      responsed,
      notResponse,
    };
  }

  private buildConvertSubmissionToJson(submissions?: FormSubmissionDocument[]): Subscriber[] {
    if (!submissions) {
      return [];
    }
    return submissions.map((sub) => sub.toJSON());
  }
}
