import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { ImagesService } from '../images/images.service';
import { RequestWithUser } from '../request/request';
import { Observable } from 'rxjs';

@Injectable()
export class AdminUserAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: RequestWithUser): Promise<boolean> {
    if (!request.user) return false;

    return await this.usersService.isUserAdmin(request.user.id);
  }
}
