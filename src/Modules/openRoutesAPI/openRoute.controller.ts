import { Controller, Post, Body } from '@nestjs/common';
import { OpenRouteService } from './openRoute.service';
import { PointEntity } from '../Points/points.entity';

@Controller('route')
export class RouteController {
  constructor(private readonly openRouteService: OpenRouteService) {}

  @Post('get-route')
  async getRoute(@Body() points: PointEntity[]): Promise<any> {
    return this.openRouteService.getRouteBetweenPoints(points);
  }
}