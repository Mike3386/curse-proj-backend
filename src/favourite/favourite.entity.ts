import { IsNotEmpty, IsString, IsEmpty, IsArray } from 'class-validator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'favourite' })
export class Favourite {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
