import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { LoginResponse } from '../dtos/login.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return { accessToken };
  }
}
