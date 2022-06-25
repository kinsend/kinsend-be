/* eslint-disable @typescript-eslint/no-empty-interface */
import { Tags } from '../../tags/tags.schema';
import { AutomationCreatePayload } from '../dtos/AutomationCreatePayload.dto';

export interface AutomationUnsave extends AutomationCreatePayload {
  taggedTags?: Tags[];
  stopTaggedTags?: Tags[];
}
