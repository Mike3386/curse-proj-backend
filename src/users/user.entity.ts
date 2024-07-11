import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  IsNull,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Image } from '../images/image.entity';
import { Comment } from '../comments/comment.entity';
import { Rating } from '../rating/rating.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    default: false,
  })
  isAdmin: boolean;

  @Column({
    nullable: false,
  })
  username: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  firstName?: string;

  @Column({
    nullable: true,
  })
  lastName?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToMany(() => Image)
  @JoinTable({ name: 'favourite' })
  favourite: Image[];

  @ManyToOne(() => Rating, (rating) => rating.user)
  ratings: Rating[];
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(8, 40)
  // @IsStrongPassword({
  //   minNumbers: 2,
  //   minSymbols: 2,
  //   minLowercase: 2,
  //   minUppercase: 2,
  //   minLength: 8,
  // })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsEmpty()
  firstName?: string;

  @IsString()
  @IsEmpty()
  lastName?: string;

  @IsEmpty()
  isAdmin?: boolean;
}
