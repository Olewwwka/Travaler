import { Controller, Get, Post, Body, UseGuards, Put, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { UpdateCoordinatesDto } from '../dto/userCords.dto';
import { PermissionsGuard } from '../RolePermissions/permissions.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Put('coordinates/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard) 
  async updateCoordinates(
    @Param('id') userId: string,
    @Body() updateCoordinatesDto: UpdateCoordinatesDto,
  ) {
    return this.userService.updateCoordinates(userId, updateCoordinatesDto);
  }

  @Get(':coordinates/:id')
  async getUserCoordinates(@Param('userId') userId: string,
  ): Promise<UpdateCoordinatesDto> {
    try {
      return await this.userService.getUserCoordinates(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}