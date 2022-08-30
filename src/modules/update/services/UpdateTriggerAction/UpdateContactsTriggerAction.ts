/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { Month } from '../../../../utils/getDayOfNextWeek';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmissionDocument } from '../../../form.submission/form.submission.schema';
import { FormSubmissionFindByConditionAction } from '../../../form.submission/services/FormSubmissionFindByConditionAction.service';
import { FormSubmissionsFindByEmailAction } from '../../../form.submission/services/FormSubmissionsFindByEmailAction.service';
import { FormSubmissionsGetByLocationsAction } from '../../../form.submission/services/FormSubmissionsGetByLocationsAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { Filter } from '../../../segment/dtos/SegmentCreatePayload.dto';
import { CONDITION, FILTERS_CONTACT } from '../../../segment/interfaces/const';
import { UserDocument } from '../../../user/user.schema';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { LinkRedirectFinddByUpdateIdAction } from '../link.redirect/LinkRedirectFindByUpdateIdAction.service';
import { UpdateReportingCreateAction } from '../update.reporting/UpdateReportingCreateAction.service';
import { UpdateFindAction } from '../UpdateFindAction.service';
import { UpdateFindByIdWithoutReportingAction } from '../UpdateFindByIdWithoutReportingAction.service';
import { UpdateModelUpdateAction } from '../UpdateModelUpdateAction.service';
import { UpdateUpdateProgressAction } from '../UpdateUpdateProgressAction.service';
import { UpdateBaseTriggerAction } from './UpdateBaseTriggerAction';

@Injectable()
export class UpdateContactsTriggerAction extends UpdateBaseTriggerAction {
  constructor(
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private updateReportingCreateAction: UpdateReportingCreateAction,
    private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    private formSubmissionFindByConditionAction: FormSubmissionFindByConditionAction,
    private formSubmissionsFindByEmailAction: FormSubmissionsFindByEmailAction,
    private updateFindAction: UpdateFindAction,
    private linkRedirectFinddByUpdateIdAction: LinkRedirectFinddByUpdateIdAction,
    private updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    private updateUpdateProgressAction: UpdateUpdateProgressAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    ownerPhoneNumber: string,
    update: UpdateDocument,
    createdBy: UserDocument,
    filter: Filter,
    datetimeTrigger: Date,
  ): Promise<void> {
    let subscribers: FormSubmissionDocument[] = await this.getSubscriberByFiltersContact(
      context,
      update,
      filter,
    );
    this.updateReportingCreateAction.execute(context, update, subscribers);

    update.recipients = subscribers;
    update.save();

    this.executeTrigger(
      context,
      this.backgroudJobService,
      this.smsService,
      this.linkRediectCreateByMessageAction,
      this.formSubmissionUpdateLastContactedAction,
      this.updateUpdateProgressAction,
      this.updateFindByIdWithoutReportingAction,
      ownerPhoneNumber,
      subscribers,
      update,
      datetimeTrigger,
    );
  }

  async getSubscriberByFiltersContact(
    context: RequestContext,
    update: UpdateDocument,
    filter: Filter,
  ): Promise<FormSubmissionDocument[]> {
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

      case FILTERS_CONTACT.BIRTHDAYS_IS: {
        const { month, day } = filter;
        logger.info('Filter BIRTHDAYS_IS is running');
        const birthdayPattern = `"birthday":"${Month[month || '']}/${day}/.+"`;
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: birthdayPattern, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.BIRTHDAYS_TODAY: {
        logger.info('Filter BIRTHDAYS_TODAY is running');
        const today = new Date();
        const todayPattern = `"birthday":"${today.getMonth() + 1}/${today.getDate()}/.*"`;
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
        subscribers = this.filterFormSubmissionByBirthday(
          formSubs,
          startOfMonth,
          endOfMonth,
          'month',
        );
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
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.IS: {
            subscribers = await this.formSubmissionsFindByEmailAction.execute(
              context,
              value,
              update.createdBy._id.toString(),
            );
            break;
          }

          case CONDITION.EXIST: {
            subscribers = await this.formSubmissionsFindByEmailAction.execute(
              context,
              undefined,
              update.createdBy._id.toString(),
              true,
            );
            break;
          }

          case CONDITION.DO_NOT_EXIST: {
            subscribers = await this.formSubmissionsFindByEmailAction.execute(
              context,
              null,
              update.createdBy._id.toString(),
            );
            break;
          }

          case CONDITION.STARTS_WITH: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              email: { $regex: `^${value}.*$`, $options: 'i' },
            });
            break;
          }

          case CONDITION.CONTAINS: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              email: { $regex: `.*${value}.*$`, $options: 'i' },
            });
            break;
          }

          // Default email exist
          default: {
            subscribers = await this.formSubmissionsFindByEmailAction.execute(
              context,
              undefined,
              update.createdBy._id.toString(),
              true,
            );
            break;
          }
        }
        break;
      }

      case FILTERS_CONTACT.JOB_TITLE: {
        logger.info('Filter JOB_TITLE is running');
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.IS: {
            const jobPattern = `"job":"${value}"`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: jobPattern, $options: 'i' },
            });

            break;
          }

          case CONDITION.EXIST: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"job":`, $options: 'i' },
            });
            break;
          }

          case CONDITION.DO_NOT_EXIST: {
            subscribers = await this.getFormSubmistionDoNotHaveFieldInMetaData(
              context,
              update.createdBy._id.toString(),
              `^((?!"job":).)*$`,
            );
            break;
          }

          case CONDITION.STARTS_WITH: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"job":"${value}.*"`, $options: 'i' },
            });
            break;
          }

          case CONDITION.CONTAINS: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"job":".*${value}.*"`, $options: 'i' },
            });
            break;
          }
          // Default job exist
          default: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"job":`, $options: 'i' },
            });
          }
        }
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_JOB_TITLE: {
        logger.info('Filter DOES_NOT_HAVE_JOB_TITLE is running');
        subscribers = await this.getFormSubmistionDoNotHaveFieldInMetaData(
          context,
          update.createdBy._id.toString(),
          `^((?!"job":).)*$`,
        );
        break;
      }

      case FILTERS_CONTACT.COMPANY: {
        logger.info('Filter COMPANY is running');

        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.IS: {
            const companyPattern = `"company":"${value}"`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: companyPattern, $options: 'i' },
            });
            break;
          }

          case CONDITION.EXIST: {
            const companyPattern = `"company":`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: companyPattern, $options: 'i' },
            });
            break;
          }

          case CONDITION.DO_NOT_EXIST: {
            const companyPattern = `^((?!"company":).)*$`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              $or: [{ metaData: null }, { metaData: { $regex: companyPattern, $options: 'i' } }],
            });
            break;
          }

          case CONDITION.STARTS_WITH: {
            const companyPattern = `"company":"${value}.*"`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: companyPattern, $options: 'i' },
            });
            break;
          }

          case CONDITION.CONTAINS: {
            const companyPattern = `"company":".*${value}.*"`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: companyPattern, $options: 'i' },
            });
            break;
          }

          default:
            break;
        }

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
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.IS: {
            const industryPattern = `"industry":"${value}"`;
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: industryPattern, $options: 'i' },
            });

            break;
          }

          case CONDITION.EXIST: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"industry":`, $options: 'i' },
            });
            break;
          }

          case CONDITION.DO_NOT_EXIST: {
            subscribers = await this.getFormSubmistionDoNotHaveFieldInMetaData(
              context,
              update.createdBy._id.toString(),
              `^((?!"industry":).)*$`,
            );
            break;
          }

          case CONDITION.STARTS_WITH: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"industry":"${value}.*"`, $options: 'i' },
            });
            break;
          }

          case CONDITION.CONTAINS: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"industry":".*${value}.*"`, $options: 'i' },
            });
            break;
          }

          // Default industry exist
          default: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              metaData: { $regex: `"industry":`, $options: 'i' },
            });
          }
        }
        break;
      }

      case FILTERS_CONTACT.DOES_NOT_HAVE_INDUSTRY: {
        logger.info('Filter DOES_NOT_HAVE_INDUSTRY is running');
        subscribers = await this.getFormSubmistionDoNotHaveFieldInMetaData(
          context,
          update.createdBy._id.toString(),
          `^((?!"industry":).)*$`,
        );
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

      case FILTERS_CONTACT.LAST_CONTACTED: {
        logger.info('Filter CONTACTED_THIS_WEEK is running');
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.ON: {
            const date = moment(new Date(value || ''));

            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              lastContacted: {
                $gte: date.startOf('day').toDate(),
                $lte: date.endOf('day').toDate(),
              },
            });
            break;
          }

          case CONDITION.AFTER: {
            const date = moment(new Date(value || ''));
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              lastContacted: {
                $gt: date.endOf('day').toDate(),
              },
            });
            break;
          }

          case CONDITION.BEFORE: {
            const date = moment(new Date(value || ''));
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              lastContacted: {
                $lt: date.startOf('day').toDate(),
              },
            });
            break;
          }

          default:
            break;
        }
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

      case FILTERS_CONTACT.AGE: {
        logger.info('Filter AGE is running');
        const birthdayPattern = `"birthday":`;
        const subs = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          metaData: { $regex: birthdayPattern, $options: 'i' },
        });
        subscribers = this.filterFormSubmissionByAge(
          subs,
          Number(filter.value),
          filter.condition || CONDITION.IS,
        );
        break;
      }

      case FILTERS_CONTACT.CREATED_DATE: {
        logger.info('Filter CREATED_DATE is running');
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.ON: {
            const date = moment(new Date(value || ''));
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              createdAt: {
                $gte: date.startOf('day').toDate(),
                $lte: date.endOf('day').toDate(),
              },
            });
            break;
          }

          case CONDITION.BEFORE: {
            const date = moment(new Date(value || ''));
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              createdAt: {
                $lt: date.toDate(),
              },
            });
            break;
          }

          case CONDITION.AFTER: {
            const date = moment(new Date(value || ''));
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              createdAt: {
                $gt: date.toDate(),
              },
            });
            break;
          }

          default:
            break;
        }

        break;
      }

      case FILTERS_CONTACT.HAS_BEEN_CONTACTED: {
        logger.info('Filter HAS_BEEN_CONTACTED is running');
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          lastContacted: { $ne: null },
        });
        break;
      }

      case FILTERS_CONTACT.MOBILE: {
        logger.info('Filter MOBILE is running');
        const { condition, value } = filter;
        switch (condition) {
          case CONDITION.IS: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              'phoneNumber.phone': value,
            });
            break;
          }

          case CONDITION.EXIST: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              phoneNumber: { $ne: null },
            });
            break;
          }

          case CONDITION.DO_NOT_EXIST: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              phoneNumber: null,
            });
            break;
          }

          case CONDITION.STARTS_WITH: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              'phoneNumber.phone': { $regex: `^${value}.*` },
            });
            break;
          }

          case CONDITION.CONTAINS: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              'phoneNumber.phone': { $regex: `.*${value}.*` },
            });
            break;
          }

          // Default phone exist
          default: {
            subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
              owner: update.createdBy._id.toString(),
              phoneNumber: { $ne: null },
            });
          }
        }
        break;
      }

      case FILTERS_CONTACT.LAST_UPDATED: {
        logger.info('Filter LAST_UPDATED is running');
        subscribers = await this.handleTriggerLastUpdate(context, filter);
        break;
      }

      case FILTERS_CONTACT.CLICKED: {
        logger.info('Filter CLICKED is running');
        const linkRedirects = await this.linkRedirectFinddByUpdateIdAction.execute(
          context,
          update.id,
        );
        subscribers =
          linkRedirects.length === 0 ? [] : (linkRedirects[0].clicked as FormSubmissionDocument[]);
        break;
      }

      case FILTERS_CONTACT.LIVES_IN: {
        logger.info('Filter LIVES_IN is running');
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          location: { $regex: filter.value, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.DO_NOT_LIVES_IN: {
        logger.info('Filter LIVES_IN is running');
        subscribers = await this.formSubmissionFindByConditionAction.execute(context, {
          owner: update.createdBy._id.toString(),
          location: { $regex: `^(?!${filter.value})`, $options: 'i' },
        });
        break;
      }

      case FILTERS_CONTACT.RESPONDED: {
        try {
          logger.info('Filter RESPONDED is running');
          const { updateId } = filter;
          if (!updateId) break;

          const updateExist = await this.updateFindByIdWithoutReportingAction.execute(
            context,
            updateId,
          );
          subscribers = updateExist.recipients as FormSubmissionDocument[];
          break;
        } catch (error) {}
      }

      default:
        break;
    }
    return subscribers;
  }

  private filterFormSubmissionByBirthday(
    formSubs: FormSubmissionDocument[],
    startDate: Date,
    endDate: Date,
    filterBy: 'month' | 'day' = 'day',
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
      switch (filterBy) {
        case 'month': {
          if (startDate.getMonth() === birthday.getMonth()) return sub;
          return undefined;
        }

        case 'day': {
          const startDay = startDate.getDate();
          const endDay = endDate.getDate();
          const birthdayDay = birthday.getDate();
          if (birthdayDay >= startDay && birthdayDay <= endDay) {
            return sub;
          }
          return undefined;
        }
      }
      return undefined;
    });
  }

  private filterFormSubmissionByAge(
    formSubs: FormSubmissionDocument[],
    age: number,
    condition: CONDITION,
  ) {
    return formSubs.filter((sub) => {
      if (!sub.metaData) {
        return undefined;
      }
      const metaData = JSON.parse(sub.metaData || '');
      if (!metaData.birthday) {
        return undefined;
      }
      const ageSub = Math.floor(
        moment().diff(moment(metaData.birthday, 'MM/DD/YYYY'), 'years', true),
      );
      switch (condition) {
        case CONDITION.IS: {
          if (ageSub === age) return sub;
          return undefined;
        }

        case CONDITION.IS_AND_ABOVE: {
          if (ageSub >= age) return sub;
          return undefined;
        }

        case CONDITION.IS_AND_BELLOW: {
          if (ageSub <= age) return sub;
          return undefined;
        }

        case CONDITION.ABOVE: {
          if (ageSub > age) return sub;
          return undefined;
        }

        case CONDITION.BELOW: {
          if (ageSub < age) return sub;
          return undefined;
        }

        default:
          return undefined;
      }
    });
  }

  private getFormSubmistionDoNotHaveFieldInMetaData(
    context: RequestContext,
    owner: string,
    pattern: string,
  ) {
    return this.formSubmissionFindByConditionAction.execute(context, {
      owner,
      $or: [{ metaData: null }, { metaData: { $regex: pattern, $options: 'i' } }],
    });
  }

  private async handleTriggerLastUpdate(
    context: RequestContext,
    filter: Filter,
  ): Promise<FormSubmissionDocument[]> {
    const { condition, value } = filter;
    context.logger.info('Start Received Latest Update');
    const updateLatest = await this.updateFindAction.execute(context, {
      limit: 1,
      createdAt: moment(new Date(value || '')),
      condition,
    });
    if (updateLatest.length === 0) {
      return [];
    }
    return updateLatest[0].recipients as FormSubmissionDocument[];
  }
}
