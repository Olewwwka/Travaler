import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  UseGuards,
  Patch,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { UsersService } from '../Users/users.service';
import { Permissions } from '../RolePermissions/permissions.decorator';
import { PermissionsGuard } from '../RolePermissions/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) 
  @ApiResponse({ status: 201, description: 'User successfully registered' }) 
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() createUserDto: CreateUserDto) {
    console.log('Registration attempt:', createUserDto);
    try {
      const user = await this.usersService.create({
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
      });
      console.log('User created successfully:', user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('READ')
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getProfile(@Request() req) {
    console.log('User in request:', req.user);
    return req.user;
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('UPDATE')
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateProfile(@Request() req, @Body() updateData: { name?: string; email?: string }) {
    const updatedUser = await this.usersService.update(req.user.id, updateData);
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('UPDATE')
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(@Request() req, @Body() data: { currentPassword: string; newPassword: string }) {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestException('Неверный текущий пароль');
    }

    await this.usersService.updatePassword(req.user.id, data.newPassword);
    return { message: 'Пароль успешно изменен' };
  }
}