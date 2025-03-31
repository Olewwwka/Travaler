import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, BehaviorSubject } from 'rxjs';
import { User } from './user';
import { Router } from '@angular/router';
import { AuthResponse } from './authResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:3000/auth"
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const user = this.getUser();
    if (user) {
      this.userSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }
        if (response.access_token) {
          localStorage.setItem('Authorization', `Bearer ${response.access_token}`);
          this.router.navigate(['/map']);
        }
      }),
      catchError(error => {
        if (error.status === 401) {
          throw new Error('Неверный email или пароль');
        }
        throw new Error('Произошла ошибка при входе в систему');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('Authorization');
  }

  register(email: string, password: string, name: string) : Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { email, password, name });
  }

  logout() {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  updateProfile(updateData: { name?: string; email?: string }): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, updateData).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }
}
