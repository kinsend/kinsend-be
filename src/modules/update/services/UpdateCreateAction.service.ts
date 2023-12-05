/* eslint-disable curly */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RequestContext } from '@app/utils/RequestContext';
import { User, UserDocument } from '@app/modules/user/user.schema';
import { UpdateCreatePayload } from '../dtos/UpdateCreatePayload.dto';
import { Update, UpdateDocument } from '../update.schema';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateHandleTrigerAction } from './UpdateHandleTrigerAction';

@Injectable()
export class UpdateCreateAction
{
    constructor(@InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
                @InjectModel(User.name) private userModel: Model<UserDocument>,
                private updateHandleTrigerAction: UpdateHandleTrigerAction,
                private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction)
    {
    }

    async execute(context: RequestContext, payload: UpdateCreatePayload): Promise<UpdateDocument>
    {

        const { user } = context;
        const userModel = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(user.id) });

        if(!userModel) {
            throw new Error('User not found');
        }

        // Save entity into the database.
        const createdAt = new Date();
        const update = await new this.updateModel({
            ...payload,
            messageReview: payload.message,
            createdBy: userModel,
            createdAt,
            updatedAt: createdAt,
        }).save();

        // TODO: This is not being called with `await`, why?
        this.updateHandleTrigerAction.execute(context, update, update.filter, createdAt, userModel);

        // Shorten message URLs?
        const linkCreated = await this.linkRediectCreateByMessageAction.execute(
            context,
            update,
            undefined,
            true,
        );

        update.messageReview = linkCreated.messageReview;

        return update.populate([ { path: 'createdBy', select: [ '_id' ] } ]);

    }

}
