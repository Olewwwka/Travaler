import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PhotoService } from '../services/photo.service';
import { FavoritePointsService } from '../Map/Points/favorite-points.service';
import { Point } from '../Map/Points/points.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  photoUrl: SafeUrl = '';
  hasCustomPhoto = false;
  isDefaultPhoto = false;
  favoritePoints: Point[] = [];
  isEditingName = false;
  isEditingEmail = false;
  editedName = '';
  editedEmail = '';
  originalName = '';
  originalEmail = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private photoService: PhotoService,
    private snackBar: MatSnackBar,
    private favoritePointsService: FavoritePointsService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (this.user) {
      this.editedName = this.user.name;
      this.editedEmail = this.user.email;
      this.originalName = this.user.name;
      this.originalEmail = this.user.email;
    }
    this.loadPhoto();
    this.loadFavoritePoints();
    this.photoService.photoUrl$.subscribe(url => {
      this.photoUrl = url;
      this.hasCustomPhoto = url !== 'assets/default.png';
      this.isDefaultPhoto = url === 'assets/default.png';
    });
  }

  loadFavoritePoints() {
    this.favoritePointsService.getFavoritePoints().subscribe({
      next: (points) => {
        this.favoritePoints = points;
      },
      error: (error) => {
        console.error('Error loading favorite points:', error);
        this.showError('Ошибка загрузки избранных точек');
      }
    });
  }

  removeFromFavorites(point: Point) {
    if (!point.id) return;
    this.favoritePointsService.removeFromFavorites(point.id).subscribe({
      next: () => {
        this.favoritePoints = this.favoritePoints.filter(p => p.id !== point.id);
        this.showSuccess('Точка удалена из избранного');
      },
      error: (error) => {
        console.error('Error removing point from favorites:', error);
        this.showError('Ошибка удаления точки из избранного');
      }
    });
  }

  loadPhoto() {
    this.photoService.loadPhoto().subscribe({
      error: (error) => {
        console.error('Error loading photo:', error);
        this.hasCustomPhoto = false;
        this.isDefaultPhoto = true;
        this.showError('Ошибка загрузки фото');
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showError('Размер файла не должен превышать 5MB');
        return;
      }
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        this.showError('Поддерживаются только файлы изображений (jpg, png, gif)');
        return;
      }
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    this.photoService.uploadPhoto(file).subscribe({
      next: () => {
        this.showSuccess('Фото успешно загружено');
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.showError('Ошибка загрузки фото');
      }
    });
  }

  deletePhoto() {
    if (this.isDefaultPhoto) {
      this.showError('Нельзя удалить дефолтное фото');
      return;
    }
    this.photoService.deletePhoto().subscribe({
      next: () => {
        this.showSuccess('Фото успешно удалено');
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
        this.showError('Ошибка удаления фото');
      }
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default.png';
    this.hasCustomPhoto = false;
    this.isDefaultPhoto = true;
    this.photoService.setDefaultPhoto();
  }

  editName() {
    this.isEditingName = true;
  }

  editEmail() {
    this.isEditingEmail = true;
  }

  cancelEditingName() {
    this.editedName = this.originalName;
    this.isEditingName = false;
  }

  cancelEditingEmail() {
    this.editedEmail = this.originalEmail;
    this.isEditingEmail = false;
  }

  saveName() {
    if (this.user && this.editedName !== this.originalName) {
      this.authService.updateProfile({ name: this.editedName }).subscribe({
        next: () => {
          this.user!.name = this.editedName;
          this.originalName = this.editedName;
          this.isEditingName = false;
          this.showSuccess('Имя успешно обновлено');
        },
        error: (error: any) => {
          console.error('Error updating name:', error);
          this.showError('Ошибка обновления имени');
        }
      });
    } else {
      this.isEditingName = false;
    }
  }

  saveEmail() {
    if (this.user && this.editedEmail !== this.originalEmail) {
      this.authService.updateProfile({ email: this.editedEmail }).subscribe({
        next: () => {
          this.user!.email = this.editedEmail;
          this.originalEmail = this.editedEmail;
          this.isEditingEmail = false;
          this.showSuccess('Email успешно обновлен');
        },
        error: (error: any) => {
          console.error('Error updating email:', error);
          this.showError('Ошибка обновления email');
        }
      });
    } else {
      this.isEditingEmail = false;
    }
  }

  changePassword() {
    if (this.currentPassword && this.newPassword && this.confirmPassword) {
      if (this.newPassword === this.confirmPassword) {
        this.authService.updatePassword(this.currentPassword, this.newPassword).subscribe({
          next: () => {
            this.showSuccess('Пароль успешно изменен');
          },
          error: (error) => {
            console.error('Error updating password:', error);
            this.showError('Ошибка изменения пароля');
          }
        });
      } else {
        this.showError('Новый пароль и подтверждение не совпадают');
      }
    } else {
      this.showError('Пожалуйста, заполните все поля');
    }
  }

  isPasswordValid() {
    return this.currentPassword && this.newPassword && this.confirmPassword;
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }
} 