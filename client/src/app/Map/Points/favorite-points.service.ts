import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Point } from './points.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritePointsService {
  private apiUrl = "http://localhost:3000/favorite-points";

  constructor(private http: HttpClient) {}

  getFavoritePoints(): Observable<Point[]> {
    return this.http.get<Point[]>(this.apiUrl);
  }

  isFavorite(pointId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${pointId}/is-favorite`);
  }

  addToFavorites(pointId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${pointId}`, {});
  }

  removeFromFavorites(pointId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pointId}`);
  }
} 