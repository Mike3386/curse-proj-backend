import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateReplyDto, Reply } from './reply.entity';
import { Image } from '../images/image.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Like,
  Repository,
  ILike,
  Not,
  In,
  IsNull,
} from 'typeorm';
import { ImagesService } from '../images/images.service';
import { ConfigService } from '@nestjs/config';
import got from 'got';
import { User } from '../users/user.entity';

@Injectable()
export class RepliesService {
  constructor(
    @InjectRepository(Reply)
    private tagsRepository: Repository<Reply>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,
  ) {}
}
