import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointEntity } from './points.entity';
import { PointsService } from './point.service';
import { PointsController } from './points.controller';
import { FavoritePointEntity } from './favorite-points.entity';
import { FavoritePointsService } from './favorite-points.service';
import { FavoritePointsController } from './favorite-points.controller';
import { PermissionsGuard } from '../RolePermissions/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointEntity, FavoritePointEntity]),
  ],
  controllers: [PointsController, FavoritePointsController],
  providers: [PointsService, FavoritePointsService, PermissionsGuard],
  exports: [PointsService, FavoritePointsService], 
})
export class PointsModule {}
