import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { PlacesService, Place, PlacesResponse, Review } from '../services/places.service';
import { FavoritePointsService } from '../Map/Points/favorite-points.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit {
  places: Place[] = [];
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  favoritePlaces: Set<string> = new Set();
  selectedPlace: Place | null = null;
  currentUser: User | null = null;
  newReview = {
    text: '',
    rating: 5
  };

  constructor(
    private placesService: PlacesService,
    private favoritePointsService: FavoritePointsService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    // Сначала загружаем избранные места, затем основные места
    this.loadFavoritePlaces().subscribe(() => {
      this.loadPlaces();
    });
  }

  loadFavoritePlaces() {
    return this.favoritePointsService.getFavoritePoints().pipe(
      tap({
        next: (favorites) => {
          this.favoritePlaces = new Set(favorites.map(place => place.id || ''));
          console.log('Загружены избранные места:', this.favoritePlaces);
        }
      }),
      catchError(error => {
        console.error('Ошибка при загрузке избранных мест:', error);
        this.showError('Ошибка загрузки избранных мест');
        return of([]);
      })
    );
  }

  loadPlaces() {
    this.placesService.getPlaces(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: PlacesResponse) => {
          this.places = response.places.map(place => {
            if (!place._id) {
              console.warn('Пропускаем место без _id:', place);
              return place;
            }
            const isFavorite = this.favoritePlaces.has(place._id);
            console.log(`Место ${place._id}: isFavorite = ${isFavorite}`);
            return {
              ...place,
              isFavorite
            };
          });
          this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        },
        error: (error: Error) => {
          console.error('Ошибка при загрузке мест:', error);
          this.showError('Ошибка загрузки мест');
        }
      });
  }

  toggleFavorite(place: Place) {
    if (!place._id) {
      console.warn('Попытка добавить в избранное место без _id:', place);
      return;
    }

    place.isFavorite = !place.isFavorite;
    if (place.isFavorite) {
      this.favoritePointsService.addToFavorites(place._id).subscribe({
        next: () => {
          this.showSuccess('Место добавлено в избранное');
        },
        error: (error) => {
          console.error('Ошибка при добавлении в избранное:', error);
          this.showError('Ошибка добавления в избранное');
          place.isFavorite = false; // Возвращаем предыдущее состояние
        }
      });
    } else {
      this.favoritePointsService.removeFromFavorites(place._id).subscribe({
        next: () => {
          this.showSuccess('Место удалено из избранного');
        },
        error: (error) => {
          console.error('Ошибка при удалении из избранного:', error);
          this.showError('Ошибка удаления из избранного');
          place.isFavorite = true; // Возвращаем предыдущее состояние
        }
      });
    }
  }

  deletePlace(event: Event, place: Place) {
    event.stopPropagation(); // Предотвращаем открытие модального окна
    if (!place._id) {
      console.warn('Попытка удалить место без _id:', place);
      return;
    }
    
    this.placesService.deletePlace(place._id).subscribe({
      next: () => {
        // Удаляем место из массива
        this.places = this.places.filter(p => p._id !== place._id);
        // Если удаляемое место было открыто в модальном окне, закрываем его
        if (this.selectedPlace?._id === place._id) {
          this.closePlaceDetails();
        }
        this.showSuccess('Место успешно удалено');
      },
      error: (error) => {
        console.error('Ошибка при удалении места:', error);
        this.showError('Ошибка при удалении места');
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPlaces();
    }
  }

  openPlaceDetails(place: Place) {
    this.selectedPlace = place;
    this.loadReviews(place._id);
  }

  closePlaceDetails() {
    this.selectedPlace = null;
    this.newReview = {
      text: '',
      rating: 5
    };
  }

  loadReviews(placeId: string) {
    if (!placeId) {
      console.warn('Попытка загрузить отзывы для места без ID');
      return;
    }

    this.placesService.getReviews(placeId).subscribe({
      next: (reviews) => {
        if (this.selectedPlace) {
          this.selectedPlace.reviews = reviews;
          // Вычисляем средний рейтинг
          if (reviews && reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            this.selectedPlace.averageRating = Number((sum / reviews.length).toFixed(1));
          } else {
            this.selectedPlace.averageRating = 0;
          }
        }
      },
      error: (error) => {
        console.error('Ошибка при загрузке отзывов:', error);
        this.showError('Ошибка загрузки отзывов');
      }
    });
  }

  submitReview() {
    if (!this.selectedPlace?._id || !this.newReview.text) {
      this.showError('Пожалуйста, введите текст отзыва');
      return;
    }

    if (!this.currentUser) {
      this.showError('Пожалуйста, войдите в систему, чтобы оставить отзыв');
      return;
    }

    const reviewData = {
      text: this.newReview.text,
      rating: this.newReview.rating,
      author: this.currentUser.name,
      authorPhoto: 'assets/default-avatar.png'
    };

    this.placesService.addReview(this.selectedPlace._id, reviewData).subscribe({
      next: (review) => {
        if (this.selectedPlace) {
          this.selectedPlace.reviews = [review, ...(this.selectedPlace.reviews || [])];
          // Обновляем средний рейтинг
          const sum = this.selectedPlace.reviews.reduce((acc, review) => acc + review.rating, 0);
          this.selectedPlace.averageRating = Number((sum / this.selectedPlace.reviews.length).toFixed(1));
          
          // Обновляем рейтинг в списке мест
          const placeIndex = this.places.findIndex(p => p._id === this.selectedPlace?._id);
          if (placeIndex !== -1) {
            this.places[placeIndex].averageRating = this.selectedPlace.averageRating;
          }
          
          this.newReview = {
            text: '',
            rating: 5
          };
          this.showSuccess('Отзыв добавлен');
        }
      },
      error: (error) => {
        console.error('Ошибка при добавлении отзыва:', error);
        this.showError('Ошибка добавления отзыва');
      }
    });
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