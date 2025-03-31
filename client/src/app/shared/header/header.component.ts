import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PhotoService } from '../../services/photo.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSubscription: Subscription;
  photoUrl: SafeUrl = '';

  constructor(
    private authService: AuthService,
    private photoService: PhotoService
  ) {
    this.userSubscription = this.authService.user$.subscribe((user: User | null) => {
      this.user = user;
      if (user) {
        this.loadPhoto();
      }
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.loadPhoto();
      this.photoService.photoUrl$.subscribe(url => {
        this.photoUrl = url;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadPhoto() {
    this.photoService.loadPhoto().subscribe({
      error: (error) => {
        console.error('Error loading photo:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
} 