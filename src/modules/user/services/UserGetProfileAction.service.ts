import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { User } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserGetProfileAction {
  constructor(private userFindByIdAction: UserFindByIdAction) {}

  async execute(context: RequestContext): Promise<User> {
    const { user } = context;

   return this.userFindByIdAction.execute(user.id);
  }
}
