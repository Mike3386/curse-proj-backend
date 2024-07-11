import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminUserAuthGuard } from '../auth/admin-user-auth.guard';
import { ImagesService } from '../images/images.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ImagesService))
    private readonly imagesService: ImagesService,
  ) {}

  @UseGuards(AdminUserAuthGuard)
  @Post('admin/images/users/:userId/block')
  async blockUser(@Param('userId') userId: string) {
    return await this.usersService.blockUser(userId);
  }

  @UseGuards(AdminUserAuthGuard)
  @Get('admin/images')
  async remove(@Query('limit') limit: number, @Query('offset') offset: number) {
    return await this.imagesService.getByAdmin(limit, offset);
  }

  @UseGuards(AdminUserAuthGuard)
  @Delete('admin/images/:imageId')
  async blockImage(@Param('imageId') imageId: string) {
    return await this.imagesService.removeImageAdmin(imageId);
  }
}
