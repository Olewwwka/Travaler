import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private apiUrl = 'http://localhost:3000/users/coordinates';

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    return new Observable((observer) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            observer.next({ latitude, longitude });
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      } else {
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  sendCoordinates( latitude: number, longitude: number, userId?: string,): Observable<any> {
    const url = `${this.apiUrl}/${userId}`
    console.log(url)
    return this.http
      .put(url, { latitude, longitude })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<any> {
    console.error('An error occurred:', error);
    return of(error);
  }
}