import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../../cname/cname.schema';
import { CNAMEGetByUserIdAction } from '../../cname/services/CNAMEGetByUserIdAction.service';
import { UserProfileResponse } from '../interfaces/user.interface';
import { User, UserDocument } from '../user.schema';
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

    return this.buildResponse(userProfile, cname);
  }

  private buildResponse(
    userProfile: UserDocument,
    cname: CNAMEDocument | null,
  ): UserProfileResponse {
    const response: UserProfileResponse = plainToClass(User, userProfile.toJSON());
    response.cname = cname ? plainToClass(CNAME, cname.toJSON()) : cname;
    return response;
  }
}
