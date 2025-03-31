import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Review {
  id: string;
  placeId?: string;
  author: string;
  authorPhoto?: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface Place {
  _id: string;
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  isFavorite?: boolean;
  reviews?: Review[];
  averageRating?: number;
}

export interface PlacesResponse {
  places: Place[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = `${environment.apiUrl}/points`;
  private favoritesUrl = `${environment.apiUrl}/favorite-points`;
  private reviewsUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getPlaces(page: number = 1, limit: number = 10): Observable<PlacesResponse> {
    return this.http.get<PlacesResponse>(`${this.apiUrl}/places?page=${page}&limit=${limit}`).pipe(
      map(response => {
        const placesWithReviews = response.places.map(place => {
          const placeWithId = {
            ...place,
            _id: place.id || place._id || ''
          };
          
          if (!placeWithId._id) {
            console.warn('Получено место без id:', place);
            return placeWithId;
          }
          
          this.getReviews(placeWithId._id).subscribe(reviews => {
            placeWithId.reviews = reviews;
            placeWithId.averageRating = this.calculateAverageRating(reviews);
          });
          
          return placeWithId;
        });

        return {
          ...response,
          places: placesWithReviews
        };
      })
    );
  }

  private calculateAverageRating(reviews: Review[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  getFavoritePlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(this.favoritesUrl);
  }

  addToFavorites(placeId: string): Observable<void> {
    return this.http.post<void>(`${this.favoritesUrl}/${placeId}`, {});
  }

  removeFromFavorites(placeId: string): Observable<void> {
    return this.http.delete<void>(`${this.favoritesUrl}/${placeId}`);
  }

  getReviews(placeId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.reviewsUrl}/${placeId}`);
  }

  addReview(placeId: string, review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
    return this.http.post<Review>(`${this.reviewsUrl}/${placeId}`, review);
  }

  getPlaceById(id: string): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}/places/${id}`);
  }

  deletePlace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/points/${id}`);
  }
} 