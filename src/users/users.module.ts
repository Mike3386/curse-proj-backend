import { RepliesModule } from './../replies/replies.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Image } from '../images/image.entity';
import { ImagesModule } from '../images/images.module';
import { AuthModule } from '../auth/auth.module';
import { Comment } from '../comments/comment.entity';
import { CommentsModule } from '../comments/comments.module';
import { Rating } from '../rating/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Image, Comment, Rating]),
    forwardRef(() => ImagesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => RepliesModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
