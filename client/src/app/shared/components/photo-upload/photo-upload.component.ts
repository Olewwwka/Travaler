import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="photo-upload">
      <img [src]="photoUrl" alt="Фото" class="photo-image" (error)="onImageError($event)">
      <div class="photo-actions">
        <button mat-icon-button color="primary" (click)="fileInput.click()">
          <mat-icon>photo_camera</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="onDelete()" *ngIf="hasCustomPhoto && !isDefaultPhoto">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
      <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none">
    </div>
  `,
  styles: [`
    .photo-upload {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .photo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px;
      display: flex;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .photo-upload:hover .photo-actions {
      opacity: 1;
    }
  `]
})
export class PhotoUploadComponent {
  @Input() photoUrl: SafeUrl = '';
  @Input() hasCustomPhoto = false;
  @Input() isDefaultPhoto = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() deletePhoto = new EventEmitter<void>();

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
      this.fileSelected.emit(file);
    }
  }

  onDelete() {
    this.deletePhoto.emit();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default.png';
    this.hasCustomPhoto = false;
    this.isDefaultPhoto = true;
  }

  private showError(message: string) {
    // Здесь можно добавить логику отображения ошибок
    console.error(message);
  }
} 