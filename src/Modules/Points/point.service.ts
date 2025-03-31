// points.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointEntity } from './points.entity';
import { CreatePointDto } from './create-point.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointEntity)
    private pointsRepository: Repository<PointEntity>,
  ) {}

  async getAllPoints(): Promise<PointEntity[]> {
    return this.pointsRepository.find();
  }

  async getPlacesWithPagination(page: number, limit: number): Promise<{ places: PointEntity[], total: number }> {
    const [places, total] = await this.pointsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        name: 'ASC'
      }
    });

    return { places, total };
  }

  async getPointByName(name: string): Promise<PointEntity> {
    const point = await this.pointsRepository
      .createQueryBuilder('point')
      .where('LOWER(point.name) = LOWER(:name)', { name })
      .getOne();
  
    if (!point) {
      throw new NotFoundException(`Точка с именем ${name} не найдена`);
    }
  
    return point;
  }

  async getPointById(id: string): Promise<PointEntity> {
    const point = await this.pointsRepository
      .createQueryBuilder('point')
      .where({ id })
      .getOne();
  
    if (!point) {
      throw new NotFoundException(`Точка с ID ${id} не найдена`);
    }
  
    return point;
  }

  async deletePoint(id: string){
    return this.pointsRepository.delete(id);
  }

  async createPoint(createPointDto: CreatePointDto): Promise<PointEntity> {
    const point = this.pointsRepository.create(createPointDto);
    return this.pointsRepository.save(point);
  }
  
}
