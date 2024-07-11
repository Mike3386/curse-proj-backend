import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { Public } from './public';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RequestWithUser } from '../request/request';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from '../users/user.entity';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('auth/register')
  async register(@Body() user: CreateUserDto) {
    const { password, ...data } = await this.authService.register(user);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
