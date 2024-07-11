import { TagsService } from './tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './tags.controller';
import { Module, forwardRef } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';
import { Tag } from './tag.entity';
import { UsersModule } from '../users/users.module';
import { ImagesModule } from '../images/images.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, User, Tag]),
    forwardRef(() => UsersModule),
    forwardRef(() => ImagesModule),
    ConfigModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
