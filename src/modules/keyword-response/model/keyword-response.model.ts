import { TaskDocument } from '../../automation/task.schema';
import { AutoKeyWordResponse } from '../auto-keyword-response.schema';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';

export interface KeywordResponseModel extends KeywordResponseDocument {
  hashtagAndEmoji: AutoKeyWordResponse[];
  regex: AutoKeyWordResponse[];
}
