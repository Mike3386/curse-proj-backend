import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { Module, forwardRef } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';
import { Tag } from '../tags/tag.entity';
import { UsersModule } from '../users/users.module';
import { TagsModule } from '../tags/tags.module';
import { ConfigModule } from '@nestjs/config';
import { Comment } from '../comments/comment.entity';
import { CommentsModule } from '../comments/comments.module';
import { Rating } from '../rating/rating.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Image, User, Tag, Comment, Rating]),
    forwardRef(() => UsersModule),
    forwardRef(() => TagsModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
