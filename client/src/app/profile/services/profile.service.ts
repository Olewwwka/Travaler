import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../auth/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  updateProfile(data: { name?: string; email?: string }): Observable<User> {
    return this.http.put<User>(this.apiUrl, data);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, {
      currentPassword,
      newPassword
    });
  }

  uploadPhoto(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<void>(`${this.apiUrl}/photo`, formData);
  }

  deletePhoto(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/photo`);
  }
} 