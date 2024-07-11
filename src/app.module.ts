import { RepliesController } from './replies/replies.controller';
import { RepliesModule } from './replies/replies.module';
import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config/dist';
import { AuthModule } from './auth/auth.module';
import TypeOrmConfigFactory from './db/typeOrmConfigFactory';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth/auth.controller';
import { ImagesController } from './images/images.controller';
import { ImagesModule } from './images/images.module';
import { TagsController } from './tags/tags.controller';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { CommentsController } from './comments/comments.controller';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/${process.env.NODE_ENV || ''}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeOrmConfigFactory,
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ImagesModule),
    forwardRef(() => TagsModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => RatingModule),
  ],
  controllers: [
    AppController,
    AuthController,
    ImagesController,
    TagsController,
    CommentsController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
