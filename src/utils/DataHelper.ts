import ngoose, { Model } from 'mongoose';

export class DataHelper {
  public static toObjectId(id: string) {
    return new ngoose.Types.ObjectId(id);
  }
}
