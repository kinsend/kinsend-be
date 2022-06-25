/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { RequestContext } from '../../../utils/RequestContext';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { User, UserDocument } from '../../user/user.schema';
import { Automation, AutomationDocument } from '../automation.schema';
import { AutomationCreatePayload } from '../dtos/AutomationCreatePayload.dto';

@Injectable()
export class AutomationCreateAction {
  constructor(
    @InjectModel(Automation.name) private automatonModel: Model<AutomationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private imageUploadAction: ImageUploadAction,
    private backgroudJobService: BackgroudJobService,
  ) {}

  async execute(
    context: RequestContext,
    file: Express.Multer.File | undefined,
    payload: AutomationCreatePayload,
  ): Promise<AutomationDocument> {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.imageUploadAction.execute(context, file);
    }

    const user = new this.userModel(context.user);
    const response = await new this.automatonModel({ ...payload, owner: user, imageUrl }).save();

    // Add backgroud job for schedule trigger action
    this.backgroudJobService.job('Fri Jun 17 2022 16:11:30 GMT+0700', 1000, async () => {
      // TODO: handle send action of automation
      console.log('Running....');
    });
    return response;
  }
}
