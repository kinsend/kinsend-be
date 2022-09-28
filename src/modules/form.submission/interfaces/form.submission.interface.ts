import { ObjectId } from 'mongoose';

export interface FormSubmissionsCountResponse {
  _id: ObjectId;
  count: number;
}
