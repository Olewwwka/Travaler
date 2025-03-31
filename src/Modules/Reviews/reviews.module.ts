import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewEntity } from './Entities/review.entity';
import { PointEntity } from '../Points/points.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, PointEntity])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {} 