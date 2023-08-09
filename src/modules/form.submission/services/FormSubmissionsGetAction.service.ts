/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';
import mongoose from 'mongoose';

@Injectable()
export class FormSubmissionsGetAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, limit : number, pageNumber : number, searchFilter : string) {

    let whereConditions : any = {
      owner: new mongoose.Types.ObjectId(context.user.id),
    };

    if(searchFilter){

      whereConditions = { $or : [
        {
          owner : new mongoose.Types.ObjectId(context.user.id),
          email : { $regex : `.*${searchFilter}.*`, $options : 'i' }
        },
        {
          owner : new mongoose.Types.ObjectId(context.user.id),
          firstName : { $regex : `.*${searchFilter}.*`, $options : 'i' }
        },
        {
          owner : new mongoose.Types.ObjectId(context.user.id),
          lastName : { $regex : `.*${searchFilter}.*`, $options : 'i' }
        },
        {
          owner : new mongoose.Types.ObjectId(context.user.id),
          "phoneNumber.phone" : { $regex : `.*${searchFilter}.*`, $options : 'i' }
        }
      ]};
      
    }

    let totalFormSubmissions = await this.formSubmissionModel.countDocuments(whereConditions);

    let totalNumberOfPages = Math.ceil(totalFormSubmissions / limit);


    let mongooseAggregateConditions : mongoose.PipelineStage[] = [
      {
        $match : whereConditions,
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
          updatedAt : 1
        }
      },
      {
        $skip : (pageNumber - 1) * limit
      },
      {
        $limit : limit
      }
    ];

    let formSubmissionRes = await this.formSubmissionModel.aggregate(mongooseAggregateConditions)

    return {
      data : formSubmissionRes,
      totalNumberOfSubmission : totalFormSubmissions,
      totalNumberOfPages : totalNumberOfPages,
    }

  }

}
