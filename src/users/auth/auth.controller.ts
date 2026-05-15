import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { LoginResponse } from '../dtos/login.response';
import { UserService } from '../user/user.service';
import type { AuthRequest } from './auth.request';
import { AuthGuard } from '../guards/auth.guard';
import { Public } from '../decorators/public.decorator';
import { Role } from '../dtos/role.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'exposeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return { accessToken };
  }

  @Get('profile')
  async getProfile(@Request() request: AuthRequest): Promise<User> {
    const user = await this.userService.findOne(request.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  adminOnly(): { message: string } {
    return { message: 'This is for admins only!' };
  }
}
