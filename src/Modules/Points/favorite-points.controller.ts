import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritePointsService } from './favorite-points.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { PermissionsGuard } from '../RolePermissions/permissions.guard';
import { Permissions } from '../RolePermissions/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Favorite Points')
@Controller('favorite-points')
export class FavoritePointsController {
  constructor(private readonly favoritePointsService: FavoritePointsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('READ')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite points' })
  @ApiResponse({ status: 200, description: 'List of favorite points' })
  async getFavoritePoints(@Request() req) {
    return this.favoritePointsService.getFavoritePoints(req.user.id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('READ')
  @Get(':pointId/is-favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if point is favorite' })
  @ApiResponse({ status: 200, description: 'Boolean indicating if point is favorite' })
  async isFavorite(@Request() req, @Param('pointId') pointId: string) {
    return this.favoritePointsService.isFavorite(req.user.id, pointId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('CREATE')
  @Post(':pointId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add point to favorites' })
  @ApiResponse({ status: 201, description: 'Point added to favorites' })
  async addToFavorites(@Request() req, @Param('pointId') pointId: string) {
    return this.favoritePointsService.addToFavorites(req.user.id, pointId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('DELETE')
  @Delete(':pointId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove point from favorites' })
  @ApiResponse({ status: 200, description: 'Point removed from favorites' })
  async removeFromFavorites(@Request() req, @Param('pointId') pointId: string) {
    return this.favoritePointsService.removeFromFavorites(req.user.id, pointId);
  }
} 