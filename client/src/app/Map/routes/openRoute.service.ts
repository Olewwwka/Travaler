import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Point } from '../Points/points.model';

@Injectable({
  providedIn: 'root',
})
export class OpenRouteService {
    private apiUrl = "http://localhost:3000/route";

  constructor(private http: HttpClient) {}

  getRouteBetweenPoints(points: Point[]) {
    return this.http.post(`${this.apiUrl}/get-route`, points);
  }
}