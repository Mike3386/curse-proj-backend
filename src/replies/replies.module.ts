import { RepliesService } from './replies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepliesController } from './replies.controller';
import { Module, forwardRef } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';
import { Reply } from './reply.entity';
import { Comment } from '../comments/comment.entity';
import { UsersModule } from '../users/users.module';
import { ImagesModule } from '../images/images.module';
import { CommentsModule } from '../comments/comments.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, User, Comment, Reply]),
    forwardRef(() => UsersModule),
    forwardRef(() => ImagesModule),
    forwardRef(() => CommentsModule),
    ConfigModule,
  ],
  controllers: [RepliesController],
  providers: [RepliesService],
  exports: [RepliesService],
})
export class RepliesModule {}
