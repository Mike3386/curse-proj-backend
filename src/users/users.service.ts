import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User, CreateUserDto } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { ImagesService } from '../images/images.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => ImagesService))
    private imageService: ImagesService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByUserName(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  remove(id: string): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  create(user: CreateUserDto): Promise<User> {
    return this.usersRepository.save(user);
  }

  async isUserHasImage(userId: string, imageId: string) {
    return !!(await this.usersRepository.findOne({
      where: { id: userId, images: { id: imageId } },
      relations: {
        images: true,
      },
      loadRelationIds: true,
    }));
  }

  async isUserAdmin(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return !!user && user.isAdmin;
  }

  async blockUser(userId: string) {
    return Promise.all([
      this.usersRepository.update({ id: userId }, { isActive: false }),
      this.imageService.blockUserImages(userId),
    ]);
  }
}
