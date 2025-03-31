import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './Entities/review.entity';
import { PointEntity } from '../Points/points.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(PointEntity)
    private pointRepository: Repository<PointEntity>
  ) {}

  async getReviews(pointId: string): Promise<ReviewEntity[]> {
    const point = await this.pointRepository.findOne({ where: { id: pointId } });
    if (!point) {
      throw new NotFoundException(`Место с ID ${pointId} не найдено`);
    }
    return this.reviewRepository.find({
      where: { point: { id: pointId } },
      order: { createdAt: 'DESC' }
    });
  }

  async createReview(pointId: string, reviewData: CreateReviewDto): Promise<ReviewEntity> {
    const point = await this.pointRepository.findOne({ where: { id: pointId } });
    if (!point) {
      throw new NotFoundException(`Место с ID ${pointId} не найдено`);
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      point: point
    });
    return this.reviewRepository.save(review);
  }
} 