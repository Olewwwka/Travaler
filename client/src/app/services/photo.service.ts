import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private photoUrlSubject = new BehaviorSubject<SafeUrl>('/assets/default.png');
  photoUrl$ = this.photoUrlSubject.asObservable();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', token || '');
  }

  private isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadPhoto(): Observable<void> {
    if (!this.isAuthenticated()) {
      this.setDefaultPhoto();
      return new Observable(subscriber => {
        subscriber.next();
      });
    }

    return new Observable(subscriber => {
      this.http.get(`${environment.apiUrl}/users/photo`, { 
        responseType: 'blob',
        headers: this.getHeaders()
      })
        .subscribe({
          next: (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            this.photoUrlSubject.next(this.sanitizer.bypassSecurityTrustUrl(url));
            subscriber.next();
          },
          error: (error) => {
            console.error('Error loading photo:', error);
            this.setDefaultPhoto();
            subscriber.error(error);
          }
        });
    });
  }

  uploadPhoto(file: File): Observable<void> {
    if (!this.isAuthenticated()) {
      return new Observable(subscriber => {
        subscriber.error(new Error('User is not authenticated'));
      });
    }

    const formData = new FormData();
    formData.append('photo', file);

    return new Observable(subscriber => {
      this.http.post(`${environment.apiUrl}/users/upload-photo`, formData, {
        headers: this.getHeaders()
      })
        .subscribe({
          next: () => {
            this.loadPhoto().subscribe({
              next: () => subscriber.next(),
              error: (error) => subscriber.error(error)
            });
          },
          error: (error) => subscriber.error(error)
        });
    });
  }

  deletePhoto(): Observable<void> {
    if (!this.isAuthenticated()) {
      return new Observable(subscriber => {
        subscriber.error(new Error('User is not authenticated'));
      });
    }

    return new Observable(subscriber => {
      this.http.delete(`${environment.apiUrl}/users/delete-photo`, {
        headers: this.getHeaders()
      })
        .subscribe({
          next: () => {
            this.setDefaultPhoto();
            subscriber.next();
          },
          error: (error) => subscriber.error(error)
        });
    });
  }

  setDefaultPhoto() {
    this.photoUrlSubject.next('/assets/default.png');
  }
} 