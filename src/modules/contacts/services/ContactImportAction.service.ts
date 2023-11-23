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
import { Inject, Injectable } from '@nestjs/common';
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
import { TagsCreateAction } from '@app/modules/tags/services/TagsCreateAction.service';
import { TagsSearchByName } from '@app/modules/tags/services/TagsSearchByNameAction.service';
import { TagsGetByIdAction } from '../../tags/services/TagsGetByIdAction.service';
import { Tags } from '../../tags/tags.schema';

@Injectable()
export class ContactImportAction {
  @Inject()
  private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction;

  @Inject()
  private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction;

  @Inject()
  private userFindByIdAction: UserFindByIdAction;

  @Inject()
  private automationGetByTagIdsAction: AutomationGetByTagIdsAction;

  @Inject()
  private automationBaseTriggeAction: AutomationBaseTriggeAction;

  @Inject()
  private backgroudJobService: BackgroudJobService;

  @Inject()
  private smsService: SmsService;

  @Inject()
  private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction;

  @Inject()
  private contactImportHistoryCreateAction: ContactImportHistoryCreateAction;

  @Inject()
  private tagsCreateAction: TagsCreateAction;

  @Inject()
  private tagsSearchByName: TagsSearchByName;

  @Inject()
  private tagsGetByIdAction: TagsGetByIdAction;

  @InjectModel(FormSubmission.name)
  private FormSubmissionModel: Model<FormSubmissionDocument>;

  constructor() {}

  async execute(context: RequestContext, payload: ContactImportPayload): Promise<any> {
    try {
      const { isOverride, tagId, row, numbersColumnMapped, numbersContactImported } = payload;
      const promiseUpdate: any[] = [];
      const promiseInsert: any[] = [];
      const contactUpdateTags: FormSubmissionDocument[] = [];
      const phoneNumbers: Set<string> = new Set();

      // Fetch override tag.
      const inboundTag: { [key: string]: string } = {};
      if (tagId) {
        let tagDoc = await this.tagsGetByIdAction.execute(context, tagId);
        if (tagDoc == null) {
          throw new Error(`Cannot find requested inbound tagId ${tagId}!`);
        }
        inboundTag[tagDoc.name] = tagId;
      }

      let skippedContacts = 0;
      for (const contactPayload of payload.contacts) {

        if(phoneNumbers.has(JSON.stringify(contactPayload.phoneNumber))) {
          context.logger.info(`${context.user.id} CSV file contains duplicates for phone number ${JSON.stringify(contactPayload.phoneNumber)}! Skipping duplicate and applying FIFO policy!`)
          skippedContacts++;
          continue;
        }

        phoneNumbers.add(JSON.stringify(contactPayload.phoneNumber));

        //@formatter:off
        context.logger.info(`${context.user.id} Searching for contact number ${JSON.stringify(contactPayload.phoneNumber)}`);
        //@formatter:on

        const contact = await this.formSubmissionFindByPhoneNumberAction.execute(
          context,
          contactPayload.phoneNumber,
          context.user.id,
        );

        //@formatter:off
        context.logger.info(`${context.user.id} ${contact.length == 0 ? 'does not have' : 'has'} contact with details ${JSON.stringify(contactPayload.phoneNumber)}.`);
        //@formatter:on

        const metadata = contactPayload.metaData && JSON.parse(contactPayload.metaData);

        // Merge inboundTag with CSV defined tags.
        const contactTags: { [key: string]: string } = { ...inboundTag };

        // Process CSV tags
        if (metadata.tags) {
          // `;` because `,` is CSV delimiter.
          const tagsArray = [...metadata.tags.split(';')].filter(n => n !== null && !n.match(/^( *)$/g));

          for (const tag of tagsArray) {
            const databaseTag = await this.getOrCreateTag(context, tag);
            contactTags[databaseTag.name] = databaseTag._id.toString();
          }

          contactPayload.metaData = JSON.stringify({ ...metadata, tags: undefined });
        }

        if (contact.length !== 0) {
          if (isOverride !== true) {
            // Skip when contact exist
            //@formatter:off
            context.logger.debug(`${context.user.id} Skipping existing contact ${JSON.stringify(contactPayload.phoneNumber)}`);
            //@formatter:on
            skippedContacts++;
            continue;
          }
          // override contact exist
          const contactUpdate = dynamicUpdateModel<FormSubmissionDocument>(contactPayload,contact[0]);
          if (Object.entries(contactTags).length > 0) {
            contactUpdate.tags = Object.values(contactTags) as any;
            contactUpdateTags.push(contactUpdate);
          }

          //@formatter:off
          context.logger.debug(`${context.user.id} is scheduling contact update for phone number ${JSON.stringify(contactPayload.phoneNumber)} with tags ${JSON.stringify(contactTags)} and metadata ${JSON.stringify(contactPayload.metaData)}`);
          //@formatter:on

          promiseUpdate.push(contactUpdate.save());

        } else {
          //@formatter:off
          context.logger.debug(`${context.user.id} is scheduling contact insert for phone number ${JSON.stringify(contactPayload.phoneNumber)}`);
          //@formatter:on

          promiseInsert.push(
            new this.FormSubmissionModel({
              ...contactPayload,
              tags: Object.values(contactTags) as any,
              owner: context.user.id,
            }).save(),
          );
        }
      }

      // Start saving records into the database.
      const promiseUpdateChunked = chunk(promiseUpdate, 10);
      const updatedContacts: any[] = [];
      for (const chunks of promiseUpdateChunked) {
        context.logger.info(`Batch updating records in the database ${JSON.stringify(chunks)}`);
        const result = await Promise.all(chunks);
        updatedContacts.push(...result);
      }

      const promiseInsertChunked = chunk(promiseInsert, 20);
      const createdContacts: any[] = [];
      for (const chunks of promiseInsertChunked) {
        const result = await Promise.all(chunks);
        createdContacts.push(...result);
      }

      this.handleAutomation(context, tagId, contactUpdateTags, createdContacts);

      await this.contactImportHistoryCreateAction.execute(context, {
        numbersColumnMapped,
        numbersContact: row,
        numbersContactImported: numbersContactImported - skippedContacts,
      });
    } catch (error) {
      throw new IllegalStateException(error.message || error);
    }
  }

  private async getOrCreateTag(context: RequestContext, tag: any): Promise<Tags> {
    let tagDoc = await this.tagsSearchByName.execute(context, { name: tag.trim() });

    if (!tagDoc) {
      tagDoc = await this.tagsCreateAction.execute(context, { name: tag.trim() });
    }

    return tagDoc;
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
