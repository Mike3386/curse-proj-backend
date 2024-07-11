import { User } from '../users/user.entity';
import { Request } from '@nestjs/common';

export interface RequestWithUser extends Request {
  user: User;
}
