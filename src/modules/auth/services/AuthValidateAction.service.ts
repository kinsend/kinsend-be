import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { omit } from 'lodash';
import mongoose, { Model } from 'mongoose';

import { InvalidCredentialsException } from '../../../utils/exceptions/InvalidCredentialsException';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { verify } from '../../../utils/hashUser';
import { User, UserDocument } from '../../user/user.schema';
import { UserCreateResponseDto } from '../../user/dtos/UserCreateResponse.dto';

@Injectable()
export class AuthValidateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async execute(email: string, password: string): Promise<UserCreateResponseDto> {
    const user = await this.userModel.findOne({ $or: [{ email }] });

    if (user) {
      await this.comparePassword(password, user.password || '');
      return <UserCreateResponseDto>omit(user, 'password');
    }

    throw new NotFoundException('User', 'User not found');
  }

  private async comparePassword(password: string, verifyPassword: string): Promise<void> {
    const isComparePassword = await verify(password, verifyPassword);

    if (!isComparePassword) {
      throw new InvalidCredentialsException('Username and password are not correct');
    }
  }
}
