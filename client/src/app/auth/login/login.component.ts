import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';  // Импортируем MatFormFieldModule
import { MatInputModule } from '@angular/material/input';  // Импортируем MatInputModule
import { MatLabel } from '@angular/material/form-field'; 
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink } from '@angular/router';
  

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatLabel,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  error: string | null = null;
  isLoading: boolean = false;

  constructor(private readonly authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = null;
    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/map']);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message;
      }
    });
  }
}
