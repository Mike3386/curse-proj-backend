import { Reply } from './../replies/reply.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';
import { Tag } from '../tags/tag.entity';
import { Comment } from '../comments/comment.entity';
import { Favourite } from '../favourite/favourite.entity';
import { Rating } from '../rating/rating.entity';

import { RatingSubscriber } from '../images/image-event-subscriber';

export default (config: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_DATABASE_NAME'),
    entities: [User, Image, Tag, Comment, Rating, Reply],
    subscribers: [RatingSubscriber],
    synchronize: true,
    dropSchema: !!config.get<string>('RESET_DB'),
  };
};
