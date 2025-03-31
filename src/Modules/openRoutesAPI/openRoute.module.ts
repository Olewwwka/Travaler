import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RouteController } from './openRoute.controller';
import { OpenRouteService } from './openRoute.service';

@Module({
  imports: [HttpModule],
  controllers: [RouteController],
  providers: [OpenRouteService],
})
export class RouteModule {}