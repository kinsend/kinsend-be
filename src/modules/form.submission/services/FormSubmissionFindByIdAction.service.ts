import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';
import mongoose from 'mongoose';

@Injectable()
export class FormSubmissionFindByIdAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, id: string): Promise<FormSubmissionDocument> {

    const formSubmission = await this.formSubmissionModel.findById(id);
    if (!formSubmission) {
      throw new NotFoundException('FormSubmission', 'FormSubmission not found!');
    }
    return formSubmission.populate('tags');

  }


  async getFormSubmissionById(ownerId: string, id: string): Promise<FormSubmissionDocument> {

    let mongooseAggregateConditions : mongoose.PipelineStage[] = [
      {
        $match : {
          _id: new mongoose.Types.ObjectId(id),
          owner: new mongoose.Types.ObjectId(ownerId),
        },
      },
      {
        $lookup : {
          from : 'tags',
          localField : 'tags',
          foreignField : '_id',
          as : 'tags'
        }
      },
      {
        $project : {
          _id : { $toString : '$_id' },
          firstName : 1,
          lastName : 1,
          email : 1,
          phoneNumber : 1,
          tags : {
            _id : {$toString : '$_id'},
            name : 1,
            userId : 1,
            contacts : 1,
            unknown : 1,
            createdAt : 1,
            updatedAt : 1
          },
          metaData : 1,
          createdAt : 1,
          updatedAt : 1,
          isContactHidden: 1,
          isContactArchived: 1,
          isSubscribed: 1,
          isFacebookContact: 1,
          isConversationArchived: 1,
          isConversationHidden: 1,
          isVip: 1,
        }
      },
      {
        $limit : 1
      }
    ];

    let formSubmissionRes = await this.formSubmissionModel.aggregate(mongooseAggregateConditions)

    if (!formSubmissionRes) {
      throw new NotFoundException('FormSubmission', 'FormSubmission not found!');
    }

    return formSubmissionRes[0];
  }
}