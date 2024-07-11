import {
  Controller,
  Delete,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  ParseFilePipe,
  Get,
  Query,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../request/request';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageAccessAuthGuard } from '../auth/image-access-auth.guard';
import { Public } from '../auth/public';
import { Tag } from '../tags/tag.entity';
import { SearchType } from './image.entity';

@Controller()
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Public()
  @Post('images/image-no-user')
  @UseInterceptors(FileInterceptor('image'))
  async createNoUser(
    @UploadedFile(
      new ParseFilePipe({
        validators: [],
      }),
    )
    image: Express.Multer.File,
  ) {
    return await this.imagesService.uploadWithoutUser(image);
  }

  @UseGuards(JwtAuthGuard)
  @Post('images')
  @UseInterceptors(FilesInterceptor('images[]'))
  async create(
    @Request() req: RequestWithUser,
    @UploadedFiles() images: Array<Express.Multer.File>,
    // @Body() body: CreateImageDto,
  ) {
    return await this.imagesService.upload(req.user, images);
  }

  @UseGuards(ImageAccessAuthGuard)
  @Delete('images/:imageId')
  async remove(@Param('imageId') imageId: string) {
    return await this.imagesService.remove(imageId);
  }

  @Public()
  @Get('images/public/:imageId')
  async getPublicImage(@Param('imageId') imageId: string) {
    return await this.imagesService.getPublicImage(imageId);
  }

  @Public()
  @Get('images/last-public-images')
  async getLastPublicImages(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('email') email?: string,
    @Query('tags') tags?: Tag[],
    @Query('type') type?: number,
    @Query('searchType') searchType?: SearchType,
  ) {
    return await this.imagesService.getLasPublicImages(
      limit,
      offset,
      email,
      tags,
      type,
      searchType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('images')
  async getImages(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.imagesService.getImages(req.user, limit, offset);
  }

  // @Public()
  // @Get('images-by-tags')
  // async getImagesByTags(
  //   @Query('tags') tags: Tag[],
  //   @Query('limit') limit?: number,
  //   @Query('offset') offset?: number,
  // ) {
  //   return await this.imagesService.getImagesByTags(tags, limit, offset);
  // }

  @UseGuards(ImageAccessAuthGuard)
  @Put('images/:imageId/public')
  async setPublic(@Param('imageId') imageId: string) {
    return await this.imagesService.makePublic(imageId);
  }

  @UseGuards(ImageAccessAuthGuard)
  @Put('images/:imageId/private')
  async setPrivate(@Param('imageId') imageId: string) {
    return await this.imagesService.makePrivate(imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('images/:imageId/rate')
  async rate(
    @Request() req: RequestWithUser,
    @Param('imageId') imageId: string,
    @Query('rate') rate: number,
  ) {
    return await this.imagesService.addRating(rate, imageId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('images/:imageId/favourite')
  async addFavourite(
    @Request() req: RequestWithUser,
    @Param('imageId') imageId: string,
  ) {
    return await this.imagesService.addFavourite(req.user.id, imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:imageId/favourite')
  async delFavourite(
    @Request() req: RequestWithUser,
    @Param('imageId') imageId: string,
  ) {
    return await this.imagesService.removeFavourite(req.user.id, imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('images/favourite-images')
  async listFavourite(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.imagesService.listFavoured(req.user.id, limit, offset);
  }
}
