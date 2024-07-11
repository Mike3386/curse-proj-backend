import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/user.entity';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private salt: string;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    (async () => {
      this.salt = await bcrypt.genSalt();
    })();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.usersService
      .findOneByEmail('admin@mail.ru')
      .then((user) => {
        if (!user) {
          return this.register({
            email: 'admin@mail.ru',
            password: '12345',
            username: 'admin',
            isAdmin: true,
          });
        }
      })
      .catch(console.log);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;
    if (!user.isActive) return null;

    const isPasswordRight = await bcrypt.compare(pass, user.password);
    if (!isPasswordRight) return null;

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      username: user.username,
    };
    return {
      id: user.id,
      access_token: this.jwtService.sign(payload),
      email: user.email,
      isAdmin: user.isAdmin,
      username: user.username,
    };
  }

  async register(user: CreateUserDto) {
    user.password = await bcrypt.hash(user.password, this.salt);
    return this.usersService.create(user);
  }
}
