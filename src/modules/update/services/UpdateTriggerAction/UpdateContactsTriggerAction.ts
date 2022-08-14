/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmissionDocument } from '../../../form.submission/form.submission.schema';
import { FormSubmissionFindByConditionAction } from '../../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { FormSubmissionsFindByEmailAction } from '../../../form.submission/services/FormSubmissionsFindByEmailAction.service';
import { FormSubmissionsGetByLocationsAction } from '../../../form.submission/services/FormSubmissionsGetByLocationsAction.service';
import { Filter } from '../../../segment/dtos/SegmentCreatePayload.dto';
import { FILTERS_CONTACT } from '../../../segment/interfaces/const';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateContactsTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private formSubmissionsGetByLocationsAction: FormSubmissionsGetByLocationsAction,
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    private formSubmissionFindByConditionAction: FormSubmissionFindByConditionAction,
    private formSubmissionsFindByEmailAction: FormSubmissionsFindByEmailAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
    filter: Filter,
  ): Promise<void> {
    const { logger } = context;
    const { key } = filter;
    let subscribers: FormSubmissionDocument[] = [];
    switch (key) {
      case FILTERS_CONTACT.ALL_CONTACTS: {
        logger.info('Filter ALL_CONTACTS is running');
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
        });
        break;
      }

      case FILTERS_CONTACT.BIRTHDAYS_TODAY: {
        logger.info('Filter BIRTHDAYS_TODAY is running');
        const today = new Date();
        const todayPattern = `"birthday":"${
          today.getMonth() + 1
        }/${today.getDate()}/${today.getFullYear()}"`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: todayPattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.BIRTHDAYS_THIS_WEEK: {
        logger.info('Filter BIRTHDAYS_THIS_WEEK is running');
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();
        const formSubs = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
        });
        subscribers = this.filterFormSubmissionByBirthday(formSubs, startOfWeek, endOfWeek);
        break;
      }

      case FILTERS_CONTACT.BIRTHDAYS_THIS_MONTH: {
        logger.info('Filter BIRTHDAYS_THIS_MONTH is running');
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        const formSubs = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
        });
        subscribers = this.filterFormSubmissionByBirthday(formSubs, startOfMonth, endOfMonth);
        break;
      }

      case FILTERS_CONTACT.FEMALE_CONTACTS: {
        logger.info('Filter FEMALE_CONTACTS is running');
        const FeamlePattern = `"gender":"Female"`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: FeamlePattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.MALE_CONTACTS: {
        logger.info('Filter MALE_CONTACTS is running');
        const FeamlePattern = `"gender":"Male"`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: FeamlePattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.HAS_GENDER: {
        logger.info('Filter HAS_GENDER is running');
        const FeamlePattern = `"gender":"(Female|Male|Other")`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: FeamlePattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.HAS_NO_GENDER: {
        logger.info('Filter HAS_NO_GENDER is running');
        const FeamlePattern = `^((?!"gender":"(Female|Male|Other")).)*$`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: FeamlePattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_EMAIL: {
        logger.info(`Filter DOES_NOT_HAVE_EMAIL is running`);
        subscribers = await this.formSubmissionsFindByEmailAction.execute(
          context,
          undefined,
          update.createdBy._id.toString(),
        );
        break;
      }

      case FILTERS_CONTACT.EMAIL: {
        logger.info('Filter EMAIL is running');
        subscribers = await this.formSubmissionsFindByEmailAction.execute(
          context,
          undefined,
          update.createdBy._id.toString(),
          true,
        );
        break;
      }

      case FILTERS_CONTACT.JOB_TITLE: {
        logger.info('Filter JOB_TITLE is running');
        const jobPattern = `"job":`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: jobPattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_JOB_TITLE: {
        logger.info('Filter DOES_NOT_HAVE_JOB_TITLE is running');
        const jobPattern = `^((?!"job":).)*$`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          $or: [{ metaData: null }, { metaData: { $regex: jobPattern, $options: 'i' } }],
        });
        break;
      }

      case FILTERS_CONTACT.COMPANY: {
        logger.info('Filter COMPANY is running');
        const jobPattern = `"company":`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: jobPattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_COMPANY: {
        logger.info('Filter DOES_NOT_HAVE_COMPANY is running');
        const companyPattern = `^((?!"company":).)*$`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          $or: [{ metaData: null }, { metaData: { $regex: companyPattern, $options: 'i' } }],
        });
        break;
      }

      case FILTERS_CONTACT.INDUSTRY: {
        logger.info('Filter INDUSTRY is running');
        const industryPattern = `"industry":`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: industryPattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_INDUSTRY: {
        logger.info('Filter DOES_NOT_HAVE_INDUSTRY is running');
        const industryPattern = `^((?!"industry":).)*$`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          $or: [{ metaData: null }, { metaData: { $regex: industryPattern, $options: 'i' } }],
        });
        break;
      }

      case FILTERS_CONTACT.ADDED_THIS_WEEK: {
        logger.info('Filter ADDED_THIS_WEEK is running');
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        });
        break;
      }

      case FILTERS_CONTACT.ADDED_LAST_WEEK: {
        logger.info('Filter ADDED_LAST_WEEK is running');
        const startOfLastWeek = moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
        const endOfLastWeek = moment().subtract(1, 'weeks').endOf('isoWeek').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          createdAt: {
            $gte: startOfLastWeek,
            $lte: endOfLastWeek,
          },
        });
        break;
      }

      case FILTERS_CONTACT.ADDED_THIS_MONTH: {
        logger.info('Filter ADDED_THIS_MONTH is running');
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        });
        break;
      }

      case FILTERS_CONTACT.ADDED_LAST_MONTH: {
        logger.info('Filter ADDED_LAST_MONTH is running');
        const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
        const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth,
          },
        });
        break;
      }

      case FILTERS_CONTACT.ADDED_THIS_YEAR: {
        logger.info('Filter ADDED_THIS_YEAR is running');
        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        });
        break;
      }

      case FILTERS_CONTACT.CONTACT_IS_ARCHIVED: {
        logger.info('Filter CONTACT_IS_ARCHIVED is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isContactArchived: true,
        });
        break;
      }

      case FILTERS_CONTACT.CONTACT_IS_NOT_ARCHIVED: {
        logger.info('Filter CONTACT_IS_NOT_ARCHIVED is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isContactArchived: false,
        });
        break;
      }

      case FILTERS_CONTACT.CONTACT_IS_HIDDEN: {
        logger.info('Filter CONTACT_IS_HIDDEN is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isContactHidden: true,
        });
        break;
      }

      case FILTERS_CONTACT.CONTACT_IS_NOT_HIDDEN: {
        logger.info('Filter CONTACT_IS_HIDDEN is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isContactHidden: false,
        });
        break;
      }

      case FILTERS_CONTACT.IS_SUBSCRIBED: {
        logger.info('Filter IS_SUBSCRIBED is running');
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isSubscribed: true,
        });
        break;
      }

      case FILTERS_CONTACT.IS_NOT_SUBSCRIBED: {
        logger.info('Filter IS_NOT_SUBSCRIBED is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isSubscribed: false,
        });
        break;
      }

      case FILTERS_CONTACT.IS_FACEBOOK_CONTACT: {
        logger.info('Filter IS_FACEBOOK_CONTACT is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isFacebookContact: true,
        });
        break;
      }

      case FILTERS_CONTACT.IS_NOT_FACEBOOK_CONTACT: {
        logger.info('Filter IS_NOT_FACEBOOK_CONTACT is running');

        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          isFacebookContact: false,
        });
        break;
      }

      case FILTERS_CONTACT.CONTACTED_THIS_WEEK: {
        logger.info('Filter CONTACTED_THIS_WEEK is running');
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        });
        break;
      }

      case FILTERS_CONTACT.CONTACTED_LAST_WEEK: {
        logger.info('Filter CONTACTED_LAST_WEEK is running');
        const startOfLastWeek = moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
        const endOfLastWeek = moment().subtract(1, 'weeks').endOf('isoWeek').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: {
            $gte: startOfLastWeek,
            $lte: endOfLastWeek,
          },
        });
        break;
      }

      case FILTERS_CONTACT.CONTACTED_THIS_MONTH: {
        logger.info('Filter CONTACTED_THIS_MONTH is running');
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        });
        break;
      }

      case FILTERS_CONTACT.CONTACTED_LAST_MONTH: {
        logger.info('Filter CONTACTED_LAST_MONTH is running');
        const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
        const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth,
          },
        });
        break;
      }

      case FILTERS_CONTACT.CONTACTED_THIS_YEAR: {
        logger.info('Filter CONTACTED_THIS_YEAR is running');
        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        });
        break;
      }

      default:
        break;
    }
    this.updateReportingCreateAction.execute(context, update, subscribers);

    update.recipients = subscribers;
    update.save();

    this.executeTrigger(
      context,
      ownerPhoneNumber,
      subscribers,
      update,
      this.backgroudJobService,
      this.smsService,
      this.linkRediectCreateByMessageAction,
    );
  }

  private filterFormSubmissionByBirthday(
    formSubs: FormSubmissionDocument[],
    startDate: Date,
    endDate: Date,
  ) {
    return formSubs.filter((sub) => {
      if (!sub.metaData) {
        return undefined;
      }
      const metaData = JSON.parse(sub.metaData || '');
      if (!metaData.birthday) {
        return undefined;
      }
      const birthday = moment(metaData.birthday, 'MM/DD/YYYY').toDate();
      if (!moment(birthday).isBetween(startDate, endDate, null, '[]')) {
        return undefined;
      }
      return sub;
    });
  }
}
