import { IsNotEmpty, IsString, IsEmpty, IsArray } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';
import { Comment } from '../comments/comment.entity';
import { Rating } from '../rating/rating.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  link: string;

  @Column({
    unique: true,
  })
  publicId: string;

  @Column({ nullable: true })
  privateLink: string;

  @Column({ default: 0, type: 'bigint' })
  viewCount: bigint;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  uploadedAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  expiredAt: Date;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.images, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'image_tags_tag',
  })
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.image)
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable({ name: 'favourite' })
  favouriteByUsers: User[];

  @ManyToOne(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @Column({ type: 'numeric', nullable: true })
  rate: number | null;
}

export class CreateImageDto {
  @IsString()
  @IsEmpty()
  name?: string;
  @IsArray()
  @IsEmpty()
  tags?: string[];
}

export type SearchType = 'uploadedAt' | 'viewCount' | 'rate';
