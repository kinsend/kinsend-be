/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
/* eslint-disable import/order */
/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable curly */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-await-in-loop */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as chunk from 'lodash/chunk';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { dynamicUpdateModel } from '../../../utils/dynamicUpdateModel';
import {
  FormSubmission,
  FormSubmissionDocument,
} from '../../form.submission/form.submission.schema';
import { FormSubmissionFindByPhoneNumberAction } from '../../form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { ContactImportPayload } from '../dtos/ContactImportPayload';
import { IllegalStateException } from '../../../utils/exceptions/IllegalStateException';
import { AutomationCreateTriggerAutomationAction } from '../../automation/services/AutomationCreateTriggerAutomationAction.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { AutomationGetByTagIdsAction } from '../../automation/services/AutomationGetByTagIdsAction.service';
import { AutomationBaseTriggeAction } from '../../automation/services/AutomationTriggerAction/AutomationBaseTriggerAction.service';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { now } from '../../../utils/nowDate';
import { SmsService } from '../../../shared/services/sms.service';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { ContactImportHistoryCreateAction } from './ContactImportHistoryCreateAction.service';
import { TagsCreateAction } from 'src/modules/tags/services/TagsCreateAction.service';
import { TagsSearchByName } from 'src/modules/tags/services/TagsSearchByNameAction.service';

@Injectable()
export class ContactImportAction {
  private looger = new Logger(ContactImportAction.name);

  @Inject() private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction;

  @Inject()
  private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction;

  @Inject() private userFindByIdAction: UserFindByIdAction;

  @Inject() private automationGetByTagIdsAction: AutomationGetByTagIdsAction;

  @Inject() private automationBaseTriggeAction: AutomationBaseTriggeAction;

  @Inject() private backgroudJobService: BackgroudJobService;

  @Inject() private smsService: SmsService;

  @Inject()
  private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction;

  @Inject() private contactImportHistoryCreateAction: ContactImportHistoryCreateAction;

  @Inject() private tagsCreateAction: TagsCreateAction;

  @Inject() private tagsSearchByName: TagsSearchByName;

  constructor(
    @InjectModel(FormSubmission.name) private FormSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, payload: ContactImportPayload): Promise<any> {
    try {
      const { isOverride, tagId, row, numbersColumnMapped, numbersContactImported } = payload;
      const promiseUpdate: any[] = [];
      const promiseInsert: any[] = [];
      const contactUpdateTags: FormSubmissionDocument[] = [];
      const tags = tagId ? [tagId] : [];
      let skippedContacts = 0;
      for (const item of payload.contacts) {
        const tempTags: any[] = [];
        const contactExist = await this.formSubmissionFindByPhoneNumberAction.execute(
          context,
          item.phoneNumber,
          context.user.id,
        );
        const metadata = item.metaData && JSON.parse(item.metaData);
        if (metadata.tags) {
          const tagsArray = metadata.tags.split(',');
          for (const tag of tagsArray) {
            if (tag.trim() === '') continue;
            const tagDoc = await this.tagsSearchByName.execute(context, { name: tag.trim() });
            if (tagDoc) {
              tempTags.push(tagDoc._id.toString());
            } else {
              const tagCreated = await this.tagsCreateAction.execute(context, { name: tag.trim() });
              tempTags.push(tagCreated._id.toString());
            }
          }
          item.metaData = JSON.stringify({ ...metadata, tags: undefined });
        }
        if (contactExist.length !== 0) {
          if (isOverride !== true) {
            // Skip when contact exist
            this.looger.debug(`Skip contact ${JSON.stringify(item.phoneNumber)}`);
            skippedContacts++;
            continue;
          }
          // override contact exist
          this.looger.debug(`Update contact ${JSON.stringify(item.phoneNumber)}`);
          const contactUpdate = dynamicUpdateModel<FormSubmissionDocument>(item, contactExist[0]);
          if (tagId || tempTags.length > 0) {
            // if (contactUpdate.tags && !contactUpdate.tags.some((tag) => tag.toString() === tagId)) {
            contactUpdate.tags = [...tags, ...tempTags] as any;
            contactUpdateTags.push(contactUpdate);
            // }
          }
          promiseUpdate.push(contactUpdate.save());
        } else {
          this.looger.debug(`Insert new contact ${JSON.stringify(item.phoneNumber)}`);
          promiseInsert.push(
            new this.FormSubmissionModel({
              ...item,
              tags: [...tags, ...tempTags],
              owner: context.user.id,
            }).save(),
          );
        }
      }
      const promiseUpdateChunked = chunk(promiseUpdate, 10);
      const contactUpdated: any[] = [];
      for (const chunks of promiseUpdateChunked) {
        const result = await Promise.all(chunks);
        contactUpdated.push(...result);
      }
      const promiseInsertChunked = chunk(promiseInsert, 10);
      const contactCreated: any[] = [];
      for (const chunks of promiseInsertChunked) {
        const result = await Promise.all(chunks);
        contactCreated.push(...result);
      }
      this.handleAutomation(context, tagId, contactUpdateTags, contactCreated);
      await this.contactImportHistoryCreateAction.execute(context, {
        numbersColumnMapped,
        numbersContact: row,
        numbersContactImported: numbersContactImported - skippedContacts,
      });
    } catch (error) {
      throw new IllegalStateException(error.message || error);
    }
  }

  private async handleAutomation(
    context: RequestContext,
    tagId: string | undefined,
    contactsUpdated: FormSubmissionDocument[],
    contactsCreated: FormSubmissionDocument[],
  ) {
    const { logger } = context;
    const user = await this.userFindByIdAction.execute(context, context.user.id);

    const result = contactsCreated.map((item) => {
      return this.automationCreateTriggerAutomationAction.execute(
        context,
        user,
        undefined,
        item.email,
        item.phoneNumber,
      );
    });
    await Promise.all(result);
    if (tagId) {
      const automations = await this.automationGetByTagIdsAction.execute(user.id, [tagId]);
      if (automations.length === 0) {
        return;
      }
      const startTimeTrigger = now(3000);
      if (!user.phoneSystem || (user.phoneSystem as any[]).length === 0) {
        return;
      }
      const phoneNumberOwner = user.phoneSystem[0];
      const from = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;
      automations.map((automation) => {
        [...contactsCreated, ...contactsUpdated].map((sub) => {
          this.backgroudJobService.job(
            startTimeTrigger,
            undefined,
            this.automationBaseTriggeAction.excuteTasks(
              context,
              this.smsService,
              undefined,
              from,
              startTimeTrigger,
              automation,
              sub.phoneNumber,
              this.formSubmissionUpdateLastContactedAction,
            ),
          );

          logger.info('\n*******************************************\n');
          logger.info({
            title: 'Finish trigger CONTACT_CREATED automation',
            automationId: automation.id,
            triggerType: 'CONTACT_CREATED',
            subscriberPhoneNumber: sub.phoneNumber,
            subscriberEmail: sub.email,
          });
        });
      });
    }
  }
}
