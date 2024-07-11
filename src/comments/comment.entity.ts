import { IsNotEmpty, IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Image } from '../images/image.entity';
import { Reply } from '../replies/reply.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  text: string;

  @ManyToOne(() => Image, (image) => image.comments)
  image: Image;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  user: User;

  @OneToMany(() => Reply, (reply) => reply.comment, { cascade: true })
  replies: Reply[];

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  imageId: string;

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

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
