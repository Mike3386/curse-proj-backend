import { IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Image } from '../images/image.entity';

@Entity({ name: 'tag' })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @ManyToMany(() => Image, (image) => image.tags, { eager: true })
  @JoinTable({
    name: 'image_tags_tag',
  })
  images: Promise<Image[]>;
}

export class CreateTagDto {
  @IsString()
  name: string;
}
