import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritePointEntity } from './favorite-points.entity';
import { PointEntity } from './points.entity';

@Injectable()
export class FavoritePointsService {
  constructor(
    @InjectRepository(FavoritePointEntity)
    private favoritePointsRepository: Repository<FavoritePointEntity>,
    @InjectRepository(PointEntity)
    private pointsRepository: Repository<PointEntity>,
  ) {}

  async addToFavorites(userId: string, pointId: string): Promise<FavoritePointEntity> {
    const point = await this.pointsRepository.findOne({ where: { id: pointId } });
    if (!point) {
      throw new NotFoundException(`Точка с ID ${pointId} не найдена`);
    }

    const existingFavorite = await this.favoritePointsRepository.findOne({
      where: {
        userId,
        pointId,
      },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    const favoritePoint = this.favoritePointsRepository.create({
      userId,
      pointId,
    });

    return this.favoritePointsRepository.save(favoritePoint);
  }

  async removeFromFavorites(userId: string, pointId: string): Promise<void> {
    const result = await this.favoritePointsRepository.delete({
      userId,
      pointId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Избранная точка не найдена');
    }
  }

  async getFavoritePoints(userId: string): Promise<PointEntity[]> {
    const favorites = await this.favoritePointsRepository.find({
      where: { userId },
      relations: ['point'],
    });

    return favorites.map(favorite => favorite.point);
  }

  async isFavorite(userId: string, pointId: string): Promise<boolean> {
    const favorite = await this.favoritePointsRepository.findOne({
      where: {
        userId,
        pointId,
      },
    });

    return !!favorite;
  }
} 