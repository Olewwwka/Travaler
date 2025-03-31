import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = '';
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = null;
    this.isLoading = true;

    if (this.password !== this.confirmPassword) {
      this.error = 'Пароли не совпадают';
      this.isLoading = false;
      return;
    }

    console.log('Sending registration data:', {
      email: this.email,
      name: this.name,
      password: this.password
    });

    this.authService.register(this.email, this.password, this.name).subscribe({
      next: () => {
        this.isLoading = false;
        window.location.href = '/auth/login';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.error = error.error?.message || 'Произошла ошибка при регистрации';
      }
    });
  }
}