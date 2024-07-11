import { Module, forwardRef } from '@nestjs/common';
import { User } from '../users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';
import { Image } from '../images/image.entity';
import { Rating } from './rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, User, Rating]),
    forwardRef(() => UsersModule),
    forwardRef(() => ImagesModule),
  ],
  controllers: [],
  providers: [],
})
export class RatingModule {}
