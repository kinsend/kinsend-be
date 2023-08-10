/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmission, FormSubmissionDocument } from '../form.submission.schema';

@Injectable()
export class FormSubmissionsGetAction {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
  ) {}

  async execute(context: RequestContext, inputLimit : number, pageNumber : number, searchFilter : string) {
    let whereConditions : any = {
      owner: new mongoose.Types.ObjectId(context.user.id),
    };
    let limit = inputLimit;
    if (inputLimit > 100) {
      limit = 100;
    }
    if (inputLimit <= 0) {
      limit = 10;
    }
    if (searchFilter) {
      whereConditions = {
        $and: [
          {
            $or: [
              {
                email: { $regex: `.*${searchFilter}.*`, $options: 'i' },
              },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$firstName', ' ', '$lastName'] },
                    regex: `.*${searchFilter}.*`,
                    options: 'i',
                  },
                },
              },
              {
                'phoneNumber.phone': { $regex: `.*${searchFilter}.*`, $options: 'i' },
              },
            ],
          },
          {
            owner: new mongoose.Types.ObjectId(context.user.id),
          },
        ],
      };
    }

    const totalFormSubmissions = await this.formSubmissionModel.countDocuments(whereConditions);

    const totalNumberOfPages = Math.ceil(totalFormSubmissions / limit);


    const mongooseAggregateConditions : mongoose.PipelineStage[] = [
      {
        $match : whereConditions,
      },
      {
        $lookup : {
          from : 'tags',
          localField : 'tags',
          foreignField : '_id',
          as : 'tags',
        },
      },
      {
        $project : {
          _id : { $toString : '$_id' },
          firstName : 1,
          lastName : 1,
          name : {$concat : ["$firstName", " ", "$lastName"]},
          email : 1,
          phoneNumber : 1,
          tags : {
            _id : {$toString : '$_id'},
            name : 1,
            userId : 1,
            contacts : 1,
            unknown : 1,
            createdAt : 1,
            updatedAt : 1,
          },
          metaData : 1,
          createdAt : 1,
          updatedAt : 1,
          owner: { $toString : '$owner' },
        },
      },
      {
        $skip : (pageNumber - 1) * limit,
      },
      {
        $limit : limit,
      },
    ];

    const formSubmissionResponse = await this.formSubmissionModel.aggregate(mongooseAggregateConditions);

    return {
      data : formSubmissionResponse,
      totalNumberOfSubmission : totalFormSubmissions,
      totalNumberOfPages,
    };
  }
}
