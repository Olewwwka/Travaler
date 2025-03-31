import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="popup-content">
      <h3>{{ name }}</h3>
      <p>{{ description }}</p>
      <div class="popup-actions">
        <button class="popup-button" data-action="edit" (click)="onEdit.emit()">
          <mat-icon>edit</mat-icon>
          Редактировать
        </button>
        <button class="popup-button" data-action="delete" (click)="onDelete.emit()">
          <mat-icon>delete</mat-icon>
          Удалить
        </button>
        <button class="popup-button" data-action="route" (click)="onAddToRoute.emit()">
          <mat-icon>add_location</mat-icon>
          Добавить в маршрут
        </button>
      </div>
    </div>
  `,
  styles: [`
    .popup-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .popup-content h3 {
      margin: 0;
      color: #1a1a1a;
      font-size: 20px;
      font-weight: 500;
      line-height: 1.3;
    }
    .popup-content p {
      margin: 0;
      color: #4a4a4a;
      font-size: 14px;
      line-height: 1.5;
    }
    .popup-content img {
      border-radius: 8px;
      max-width: 100%;
      height: auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .popup-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    .popup-button {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
      min-width: 120px;
      justify-content: center;
      width: 100%;
    }
    .popup-button[data-action="edit"] {
      background-color: #4CAF50;
      color: white;
    }
    .popup-button[data-action="edit"]:hover {
      opacity: 0.9;
    }
    .popup-button[data-action="route"] {
      background-color: #4CAF50;
      color: white;
    }
    .popup-button[data-action="route"]:hover {
      opacity: 0.9;
    }
    .popup-button[data-action="delete"] {
      background-color: #f44336;
      color: white;
    }
    .popup-button[data-action="delete"]:hover {
      opacity: 0.9;
    }
    .popup-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class PopupComponent {
  @Input() name: string = '';
  @Input() description: string = '';
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onAddToRoute = new EventEmitter<void>();
} 