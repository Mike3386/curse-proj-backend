import { IsNotEmpty, IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Image } from '../images/image.entity';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Entity({ name: 'reply' })
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  text: string;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  comment: Comment;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column()
  userId: string;

  @Column()
  commentId: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
