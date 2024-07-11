import { IsEmpty, IsNumber } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Image } from '../images/image.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  imageId: string;

  @OneToMany(() => User, (user) => user.ratings)
  user: User;

  @OneToMany(() => Image, (image) => image.ratings)
  image: Image;

  @Column({ type: 'numeric' })
  rating: number;
}

export class CreateImageDto {
  @IsNumber()
  @IsEmpty()
  rating?: number;
}
