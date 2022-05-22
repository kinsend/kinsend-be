import { Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/utils/exceptions/BadRequestException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserUpdateProfilePayloadDto } from '../dtos/UserUpdateProfilePayload.dto';
import { User } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserUpdateProfileAction {
  constructor(private userFindByIdAction: UserFindByIdAction) {}

  async execute(context: RequestContext, payload: UserUpdateProfilePayloadDto): Promise<User> {
    const { user } = context;
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Update user fail!');
    }
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    await userInfo.update({ ...payload });

    return this.userFindByIdAction.execute(context, user.id);
  }
}
