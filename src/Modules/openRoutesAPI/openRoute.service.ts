import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PointEntity } from '../Points/points.entity';

@Injectable()
export class OpenRouteService {
  private readonly apiKey = process.env.API_KEY;
  private readonly apiUrl = 'https://api.openrouteservice.org/v2/directions';

  constructor(private httpService: HttpService) {}

  async getRouteBetweenPoints(points: PointEntity[]): Promise<any> {
    const coordinates = points.map((point) => [point.longitude, point.latitude]);
    const body = {
      coordinates,
      elevation: false,
      instructions: false,
      preference: 'recommended',
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/driving-car`, body, {
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }
}