import { RepliesModule } from './../replies/replies.module';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { Module, forwardRef } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';
import { Comment } from './comment.entity';
import { UsersModule } from '../users/users.module';
import { ImagesModule } from '../images/images.module';
import { ConfigModule } from '@nestjs/config';
import { Reply } from '../replies/reply.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, User, Comment, Reply]),
    forwardRef(() => UsersModule),
    forwardRef(() => ImagesModule),
    forwardRef(() => RepliesModule),
    ConfigModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
