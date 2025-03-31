import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { ReviewEntity } from './Entities/review.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':pointId')
  async getReviews(@Param('pointId') pointId: string): Promise<ReviewEntity[]> {
    return this.reviewsService.getReviews(pointId);
  }

  @Post(':pointId')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('pointId') pointId: string,
    @Body() reviewData: CreateReviewDto
  ): Promise<ReviewEntity> {
    return this.reviewsService.createReview(pointId, reviewData);
  }
} 