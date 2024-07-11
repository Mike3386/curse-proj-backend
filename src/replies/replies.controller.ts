import {
  Controller,
  Delete,
  Post,
  UseGuards,
  Param,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RepliesService } from './replies.service';
import { ImageAccessAuthGuard } from '../auth/image-access-auth.guard';
import { RequestUser } from '../users/user.decorator';
import { User } from '../users/user.entity';
import { CreateReplyDto } from './reply.entity';
import { ImagesService } from '../images/images.service';
import { Public } from '../auth/public';

@Controller()
export class RepliesController {
  constructor(private repliesService: RepliesService) {}

  // @UseGuards(JwtAuthGuard, ImageAccessAuthGuard)
  // @Get('images/:imageId/possible-tags')
  // async getPossibleTags(@Param('imageId') imageId: string) {
  //   return this.tagsService.getTagsForImage(imageId);
  // }

  // @UseGuards(JwtAuthGuard, ImageAccessAuthGuard)
  // @Post('images/:imageId/tags')
  // async create(
  //   @Body() tags: CreateTagDto[],
  //   @Param('imageId') imageId: string,
  // ) {
  //   return await this.tagsService.createTagsForImage(imageId, tags);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('images/:imageId/tags/:tagId')
  // async remove(
  //   @RequestUser() user: User,
  //   @Param('tagId') tagId: string,
  //   @Param('imageId') imageId: string,
  // ) {
  //   return await this.tagsService.deleteTagFromImage(imageId, tagId, user);
  // }

  // @Public()
  // @Get('tags/autocomplete')
  // async tagsAutocomplete(
  //   @Query('name') name: string,
  //   @Query('selectedIds') selectedIds?: string[],
  // ) {
  //   return await this.tagsService.tagsAutocomplete(name, selectedIds);
  // }
}
