/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { FormSubmissionGetCountByUserIdAction } from '../../form.submission/services/FormSubmissionGetCountByUserIdAction.service';
import { LinkRedirectDocument } from '../../update/link.redirect.schema';
import { LinkRedirectFindLinkClickedByCreatedByAction } from '../../update/services/link.redirect/LinkRedirectFindLinkClickedByCreatedByAction.service';
import { UpdatesGetCountByCreatedByAction } from '../../update/services/UpdatesGetCountByCreatedByAction.service';

@Injectable()
export class MessageGetStatisticAction {
  constructor(
    private formSubmissionGetCountByUserIdAction: FormSubmissionGetCountByUserIdAction,
    private updatesGetCountByCreatedByAction: UpdatesGetCountByCreatedByAction,
    private linkRedirectFindLinkClickedByCreatedByAction: LinkRedirectFindLinkClickedByCreatedByAction,
  ) {}
  async execute(context: RequestContext): Promise<any> {
    const { user } = context;
    const [totalFormSubmission, totalUpdate, linkClicked] = await Promise.all([
      this.formSubmissionGetCountByUserIdAction.execute(user.id),
      this.updatesGetCountByCreatedByAction.execute(user.id),
      this.linkRedirectFindLinkClickedByCreatedByAction.execute(context, user.id, true),
    ]);
    const totalClicked = this.caculateTotalClicked(linkClicked);
    return {
      totalFormSubmission,
      totalUpdate,
      clickedPercent: (totalClicked / totalFormSubmission) * 100,
    };
  }

  private caculateTotalClicked(linkClicked: LinkRedirectDocument[]) {
    const subs: FormSubmissionDocument[] = [];
    linkClicked.map((link) => {
      link.clicked?.map((clicked) => {
        const sub = subs.find((item) => item.id === clicked.id);
        if (!sub) {
          subs.push(clicked);
        }
      });
    });
    return subs.length;
  }
}
