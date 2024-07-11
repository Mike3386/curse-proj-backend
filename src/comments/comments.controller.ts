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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { ImageAccessAuthGuard } from '../auth/image-access-auth.guard';
import { RequestUser } from '../users/user.decorator';
import { User } from '../users/user.entity';
import { CreateCommentDto } from './comment.entity';
import { ImagesService } from '../images/images.service';
import { Public } from '../auth/public';
import { RequestWithUser } from '../request/request';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // @UseGuards(JwtAuthGuard)
  @Public()
  @Get('comments/images/:imageId')
  async getPossibleTags(@Param('imageId') imageId: string) {
    return this.commentsService.getCommentsForImage(imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/images/:imageId')
  @UseInterceptors(FileInterceptor(''))
  async createComment(
    @Request() req: RequestWithUser,
    @Param('imageId') imageId: string,
    @Body('text') text: string,
  ) {
    return await this.commentsService.addCommentForImage(
      imageId,
      req.user.id,
      text,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('comments/:commentId')
  @UseInterceptors(FileInterceptor(''))
  async updateComment(
    @Request() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body('text') text: string,
  ) {
    return await this.commentsService.editCommentForImage(
      commentId,
      req.user.id,
      text,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(
    @Request() req: RequestWithUser,
    @Param('commentId') commentId: string,
  ) {
    return await this.commentsService.removeCommentFromImage(
      commentId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:commentId/reply')
  @UseInterceptors(FileInterceptor(''))
  async createReply(
    @Request() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body('text') text: string,
  ) {
    return await this.commentsService.addReplyForComment(
      commentId,
      req.user.id,
      text,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('replies/:replyId')
  @UseInterceptors(FileInterceptor(''))
  async updateReply(
    @Request() req: RequestWithUser,
    @Param('replyId') replyId: string,
    @Body('text') text: string,
  ) {
    return await this.commentsService.editReplyForComment(
      replyId,
      req.user.id,
      text,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('replies/:replyId')
  async deleteReply(
    @Request() req: RequestWithUser,
    @Param('replyId') replyId: string,
  ) {
    return await this.commentsService.removeReplyFromComment(
      replyId,
      req.user.id,
    );
  }
}
