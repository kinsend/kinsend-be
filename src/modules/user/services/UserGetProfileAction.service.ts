import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAMEGetByUserIdAction } from '../../cname/services/CNAMEGetByUserIdAction.service';
import { UserProfileResponse } from '../interfaces/user.interface';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserGetProfileAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private cnameGetByUserIdAction: CNAMEGetByUserIdAction,
  ) {}

  async execute(context: RequestContext): Promise<UserProfileResponse> {
    const { user } = context;
    const [userProfile, cname] = await Promise.all([
      this.userFindByIdAction.execute(context, user.id),
      this.cnameGetByUserIdAction.execute(context, user.id),
    ]);
    const cnameResponse = cname ? cname.toObject() : cname;
    const response = { ...userProfile.toObject(), cname: cnameResponse };
    return response;
  }
}
