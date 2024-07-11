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
export class ImageAccessAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private imagesService: ImagesService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: RequestWithUser): Promise<boolean> {
    if (!(request as any).params && !(request as any).params.imageId)
      return false;

    return await this.usersService.isUserHasImage(
      request.user.id,
      (request as any).params.imageId,
    );
  }
}
