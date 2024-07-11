import { Reply } from './../replies/reply.entity';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateCommentDto, Comment } from './comment.entity';
import { Image } from '../images/image.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Reply)
    private repliesRepository: Repository<Reply>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,
  ) {}

  async getCommentsForImage(imageId: string) {
    return await this.commentsRepository.find({
      where: { imageId },
      relations: { replies: { user: true }, user: true },
      order: { createdAt: 'DESC', replies: { createdAt: 'DESC' } },
    });
  }

  async addCommentForImage(imageId: string, userId: string, text: string) {
    return await this.commentsRepository.save(
      this.commentsRepository.create({
        imageId,
        userId,
        text,
      }),
    );
  }

  async editCommentForImage(commentId: string, userId: string, text: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (!comment || comment.userId != userId) return;

    return await this.commentsRepository.update(
      {
        id: commentId,
      },
      {
        text,
        updatedAt: Date.now(),
      },
    );
  }

  async removeCommentFromImage(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (!comment || comment.userId != userId) return;
    return await this.commentsRepository.delete({ id: commentId });
  }

  async addReplyForComment(commentId: string, userId: string, text: string) {
    return await this.repliesRepository.save(
      this.repliesRepository.create({
        commentId,
        userId,
        text,
      }),
    );
  }

  async editReplyForComment(replyId: string, userId: string, text: string) {
    const reply = await this.repliesRepository.findOne({
      where: { id: replyId },
    });
    if (!reply || reply.userId != userId) return;

    return await this.repliesRepository.update(
      {
        id: replyId,
      },
      {
        text,
        updatedAt: Date.now(),
      },
    );
  }

  async removeReplyFromComment(replyId: string, userId: string) {
    const reply = await this.repliesRepository.findOne({
      where: { id: replyId },
    });
    if (!reply || reply.userId != userId) return;
    return await this.repliesRepository.delete({ id: replyId });
  }
}
