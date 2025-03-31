import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="field-container">
      <mat-form-field appearance="outline">
        <mat-label>{{ label }}</mat-label>
        <input 
          matInput 
          [type]="type"
          [(ngModel)]="value"
          [readonly]="!isEditing"
          (ngModelChange)="onValueChange($event)"
        >
      </mat-form-field>
      <div class="field-actions">
        <button mat-icon-button *ngIf="!isEditing" (click)="onEdit()">
          <mat-icon>settings</mat-icon>
        </button>
        <div *ngIf="isEditing" class="edit-actions">
          <button mat-icon-button color="primary" (click)="onSave()">
            <mat-icon>check</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .field-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-form-field {
      flex: 1;
    }

    .field-actions {
      display: flex;
      align-items: center;
    }

    .edit-actions {
      display: flex;
      gap: 4px;
    }
  `]
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() type: string = 'text';
  @Input() isEditing: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onValueChange(value: string) {
    this.valueChange.emit(value);
  }

  onEdit() {
    this.edit.emit();
  }

  onSave() {
    this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
} 