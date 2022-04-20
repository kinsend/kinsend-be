import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserCreatePayloadDto } from './UserCreateRequest.dto';
import { User, UserDocument } from '../user.schema';
import { UsernameConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
  ) {}

  async execute(payload: UserCreatePayloadDto): Promise<User> {
    const {email, password} = payload;
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email: email }] });

    if (checkExistedUser) {
      throw new UsernameConflictException('User has already conflicted');
    }

    const { saltRounds } = this.configService;
    const hashPass = await hashAndValidatePassword(password, saltRounds);

    const user = await new this.userModel({...payload, password: hashPass}).save();
    return user;
  }
}
