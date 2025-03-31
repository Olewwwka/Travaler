import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PointsService } from './point.service';
import { CreatePointDto } from './create-point.dto';
import { PointEntity } from './points.entity';
import { PermissionsGuard } from '../RolePermissions/permissions.guard';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get("points")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getAllPoints(): Promise<PointEntity[]> {
    return this.pointsService.getAllPoints();
  }

  @Get("places")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getPlacesWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ places: PointEntity[], total: number }> {
    return this.pointsService.getPlacesWithPagination(page, limit);
  }

  @Get("points/name/:name")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getPointByName(@Param('name') name: string): Promise<PointEntity> {
    return this.pointsService.getPointByName(name);
  }

  @Get("points/id/:id")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getPointById(@Param('id') id: string): Promise<PointEntity> {
    return this.pointsService.getPointById(id);
  }

  @Post("points")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async createPoint(@Body() createPointDto: CreatePointDto): Promise<PointEntity> {
    return this.pointsService.createPoint(createPointDto);
  }

  @Delete('points/:id')  
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async deletePoint(@Param('id') id: string) { 
    return this.pointsService.deletePoint(id);
  }
}
