// points.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Point } from './points.model';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private apiUrl = "http://localhost:3000/points/points";
  private userApi = "http://localhost:3000/users/coordinaates";

  constructor(private http: HttpClient) {}

  getAllPoints(): Observable<Point[]> {
    return this.http.get<Point[]>(this.apiUrl);
  }

  createPoint(point: Point): Observable<Point> {
    return this.http.post<Point>(this.apiUrl, point);
  }

  getPointById(id: string): Observable<Point> {
    return this.http.get<Point>(`${this.apiUrl}/${id}`);
  }

  updatePoint(id: string, point: Point): Observable<Point> {
    return this.http.put<Point>(`${this.apiUrl}/${id}`, point);
  }

  deletePoint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPointByName(name: string): Observable<Point> {
    return this.http.get<Point>(`${this.apiUrl}/name/${name}`);
  }

  getUserCoordinates(userId?: string): Observable<{ latitude: number; longitude: number }> {
    return this.http.get<{ latitude: number; longitude: number }>(`${this.userApi}/${userId}`);
  }
}
