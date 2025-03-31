import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { PointsService } from './Points/points.service';
import { Point } from './Points/points.model';
import { MapService } from './map.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { GeolocationService } from './location/location.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouteService } from './route.service';
import { OpenRouteService } from './routes/openRoute.service';
import { FavoritePointsService } from './Points/favorite-points.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PopupComponent } from './popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [
    MatButtonToggleModule,
    FormsModule,
    MatMenuModule,
    CommonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  @ViewChild('popup') popupElement!: ElementRef;
  @ViewChild('popupContent') popupContentElement!: ElementRef;
  @ViewChild('contextMenu') contextMenuElement!: ElementRef;
  @ViewChild('addPointMenu') addPointMenuElement!: ElementRef;

  points: Point[] = [];
  showPoints: boolean = true;
  private userId?: string;
  isSidebarClosed: boolean = true;
  routePoints: Point[] = [];
  showDbPoints = true;
  allDbPoints: Point[] = [];
  favoritePoints: Set<string> = new Set();
  isSidebarOpen = true;
  isPointsSidebarOpen = true;
  searchQuery = '';
  filteredDbPoints: Point[] = [];
  userLocation: Point | null = null;
  suggestions: Point[] = [];
  showSuggestions: boolean = false;
  selectedPointIndex: number = -1;
  selectedPoint: Point | null = null;

  constructor(
    private routeService: RouteService,
    private authService: AuthService,
    public mapService: MapService,
    private geolocationService: GeolocationService,
    private pointsService: PointsService,
    private openRouteService: OpenRouteService,
    private favoritePointsService: FavoritePointsService,
    private ngZone: NgZone,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.ngZone.runOutsideAngular(() => {
      this.searchQuery = '';
      this.filteredDbPoints = this.allDbPoints;
    });
  }

  private handleAuthError(error: any) {
    if (error.status === 401 || !this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
    }
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    const user = this.authService.getUser(); 
    this.userId = user?.id; 
    this.loadPoints();
    this.getMyLocation();
    this.routeService.routePoints$.subscribe((points) => {
      this.routePoints = points; 
    });
    this.loadFavoritePoints();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getMyLocation(): void {
    this.geolocationService.getCurrentLocation().subscribe({
      next: (coords) => {
        this.geolocationService.sendCoordinates(coords.latitude, coords.longitude, this.userId).subscribe({
          next: () => {
            this.mapService.centerMap(coords.latitude, coords.longitude);
            this.userLocation = {
              id: 'user-location',
              name: 'Моё местоположение',
              latitude: coords.latitude,
              longitude: coords.longitude,
              description: 'Текущее местоположение пользователя',
              isUserLocation: true
            };
            this.updateMapPoints();
          },
          error: (err) => {
            console.error('Failed to send coordinates:', err);
          },
        });
      },
      error: (err) => {
        console.error('Failed to get location:', err);
      },
    });
  }

  ngAfterViewInit(): void {
    if (!this.mapElement?.nativeElement || !this.popupElement?.nativeElement || 
        !this.popupContentElement?.nativeElement || !this.contextMenuElement?.nativeElement || 
        !this.addPointMenuElement?.nativeElement) {
      console.error('Не все необходимые элементы найдены');
      return;
    }

    this.mapService.initMap(
      this.mapElement.nativeElement,
      {
        popupElement: this.popupElement.nativeElement,
        popupContentElement: this.popupContentElement.nativeElement,
        contextMenuElement: this.contextMenuElement.nativeElement,
        addPointMenuElement: this.addPointMenuElement.nativeElement,
      },
      this.userId
    );

    // Устанавливаем обработчик клика
    this.mapService.setClickHandler((point: Point | null) => {
      if (point) {
        // Точка выбрана
        this.selectedPoint = point;
        // Можно добавить дополнительную логику при выборе точки
        console.log('Выбрана точка:', point);
      } else {
        // Точка не выбрана (клик вне точки)
        this.selectedPoint = null;
        // Можно добавить дополнительную логику при отмене выбора точки
        console.log('Точка не выбрана');
      }
    });

    this.updateMapPoints();
  }

  get filteredPoints(): Point[] {
    if (!this.searchQuery) {
      return this.allDbPoints;
    }
    const query = this.searchQuery.toLowerCase();
    return this.allDbPoints.filter(point => 
      point.name.toLowerCase().includes(query)
    );
  }

  private loadPoints(): void {
    this.pointsService.getAllPoints().pipe(
      catchError(error => {
        this.handleAuthError(error);
        return of([]);
      })
    ).subscribe((points) => {
      this.allDbPoints = points;
      this.filteredDbPoints = this.filteredPoints;
      this.updateMapPoints();
    });
  }

  togglePoints(): void {
    if (this.showPoints) {
      this.mapService.addPointsToMap(this.points); 
    } else {
      this.mapService.removePointsFromMap(); 
    }
  }

  removePoint(index: number) {
    const point = this.routePoints[index];
    if (!point.isUserLocation) {
      this.routePoints.splice(index, 1);
      this.updateMapPoints();
      this.showSuccess('Точка удалена из маршрута');
    }
  }

  movePointUp(index: number) {
    if (index > 0) {
      const temp = this.routePoints[index];
      this.routePoints[index] = this.routePoints[index - 1];
      this.routePoints[index - 1] = temp;
    }
  }

  movePointDown(index: number) {
    if (index < this.routePoints.length - 1) {
      const temp = this.routePoints[index];
      this.routePoints[index] = this.routePoints[index + 1];
      this.routePoints[index + 1] = temp;
    }
  }

  addPoint() :void {
    this.routeService.addPoint();
  }

  showOnMap(latitude: number, longitude:number) {
    if(latitude == -1 || longitude == -1) return;
    else if(latitude == undefined && longitude == undefined)  this.getMyLocation();
    this.mapService.centerMap(latitude, longitude);
    this.showSuccess('Карта центрирована на точке');
  }

  saveRoute() {
    this.openRouteService.getRouteBetweenPoints(this.routePoints).subscribe({
      next: (response) => {
        console.log('Маршрут получен:', response);
        this.mapService.drawRouteOnMap(response);
      },
      error: (err) => {
        console.error('Ошибка при получении маршрута:', err);
      },
    });
  }

  deleteRoute() {
    this.mapService.removeRouteFromMap();
  };

  toggleDbPoints(): void {
    this.showDbPoints = !this.showDbPoints;
    this.updateMapPoints();
  }

  loadFavoritePoints() {
    this.favoritePointsService.getFavoritePoints().pipe(
      catchError(error => {
        this.handleAuthError(error);
        return of([]);
      })
    ).subscribe(points => {
      this.favoritePoints = new Set(points.map(p => p.id!));
    });
  }

  updateMapPoints(): void {
    this.mapService.clearPoints();
    
    if (this.userLocation) {
      this.mapService.addPoint(this.userLocation);
    }

    if (this.showDbPoints) {
      this.allDbPoints.forEach(point => {
        if (!point.isUserLocation) {
          this.mapService.addPoint(point);
        }
      });
    }

    this.routePoints.forEach(point => {
      if (!point.isUserLocation) {
        this.mapService.addPoint(point);
      }
    });
  }

  addDbPointToRoute(dbPoint: any) {
    this.routeService.addNewPoint(dbPoint);
  }
  
  showDbPointOnMap(dbPoint: any) {
    this.showOnMap(dbPoint.latitude, dbPoint.longitude);
  }

  toggleFavorite(pointId: string | undefined) {
    if (!pointId) return;

    if (this.favoritePoints.has(pointId)) {
      this.favoritePointsService.removeFromFavorites(pointId).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return of();
        })
      ).subscribe(() => {
        this.favoritePoints.delete(pointId);
      });
    } else {
      this.favoritePointsService.addToFavorites(pointId).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return of();
        })
      ).subscribe(() => {
        this.favoritePoints.add(pointId);
      });
    }
  }

  isFavorite(pointId: string | undefined): boolean {
    return pointId ? this.favoritePoints.has(pointId) : false;
  }

  togglePointsSidebar() {
    this.isPointsSidebarOpen = !this.isPointsSidebarOpen;
  }

  movePoint(index: number, direction: number) {
    const point = this.routePoints[index];
    if (!point.isUserLocation) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.routePoints.length) {
        [this.routePoints[index], this.routePoints[newIndex]] = [this.routePoints[newIndex], this.routePoints[index]];
        this.updateMapPoints();
      }
    }
  }

  showPointOnMap(point: any) {
    this.mapService.centerMap(point.latitude, point.longitude);
  }

  addToRoute(point: Point) {
    if (!point.isUserLocation) {
      const newPoint: Point = {
        id: point.id,
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        description: point.description,
        imageUrl: point.imageUrl
      };
      this.routePoints.push(newPoint);
      this.updateMapPoints();
    }
  }

  getCurrentLocation() {
    this.getMyLocation();
  }

  showAddPointMenu(event: MouseEvent): void {
    event.stopPropagation(); // Предотвращаем всплытие события
    this.mapService.showAddPointMenu(event);
  }

  hideAddPointMenu() {
    this.mapService.hideAddPointMenu();
  }

  saveNewPoint(form: HTMLFormElement) {
    const nameInput = form.querySelector('#point-name') as HTMLInputElement;
    const descriptionInput = form.querySelector('#point-description') as HTMLTextAreaElement;
    const coordinates = this.mapService.getClickedCoordinates();

    if (!nameInput || !descriptionInput || !coordinates) return;

    const newPoint: Point = {
      name: nameInput.value,
      description: descriptionInput.value,
      latitude: coordinates[1],
      longitude: coordinates[0]
    };

    this.pointsService.createPoint(newPoint).pipe(
      catchError(error => {
        this.handleAuthError(error);
        return of();
      })
    ).subscribe({
      next: (createdPoint) => {
        this.allDbPoints.push(createdPoint);
        this.filteredDbPoints = this.allDbPoints;
        this.updateMapPoints();
        this.hideAddPointMenu();
        nameInput.value = '';
        descriptionInput.value = '';
        this.showSuccess('Точка успешно добавлена');
      },
      error: (error) => {
        console.error('Ошибка при создании точки:', error);
        this.showError('Не удалось добавить точку');
      }
    });
  }

  onPointNameInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    
    if (value.length > 0) {
      this.suggestions = this.allDbPoints.filter(point => 
        point.name.toLowerCase().includes(value) && 
        !this.routePoints.some(routePoint => routePoint.name === point.name)
      );
      this.showSuggestions = true;
      this.selectedPointIndex = index;
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  selectSuggestion(point: Point): void {
    if (this.selectedPointIndex >= 0) {
      this.routePoints[this.selectedPointIndex] = {
        ...point,
        name: point.name // Сохраняем оригинальное название
      };
      this.updateMapPoints();
      this.showSuggestions = false;
      this.suggestions = [];
    }
  }

  onBlur(): void {
    // Используем setTimeout, чтобы дать время на обработку клика по подсказке
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  editPoint(): void {
    const point = this.mapService.getSelectedPoint();
    if (point) {
      console.log('Редактирование точки:', point);
      this.showSuccess('Точка успешно отредактирована');
    }
  }

  deletePoint(): void {
    const point = this.mapService.getSelectedPoint();
    if (point?.id) {
      this.pointsService.deletePoint(point.id).subscribe({
        next: () => {
          // Сначала удаляем точку из локального массива
          this.allDbPoints = this.allDbPoints.filter(p => p.id !== point.id);
          this.filteredDbPoints = this.allDbPoints;
          // Обновляем карту
          this.updateMapPoints();
          // Очищаем выбранную точку
          this.mapService.setSelectedPoint(null);
          // Сбрасываем попап
          if (this.mapService.getPopup()) {
            this.mapService.getPopup()?.setPosition(undefined);
          }
          this.showSuccess('Точка успешно удалена');
        },
        error: (error) => {
          console.error('Ошибка при удалении точки:', error);
          this.showError('Не удалось удалить точку');
        }
      });
    }
  }

  addSelectedPointToRoute(): void {
    const point = this.mapService.getSelectedPoint();
    if (point) {
      this.routeService.addNewPoint(point);
      this.mapService.setSelectedPoint(null);
      this.showSuccess('Точка добавлена в маршрут');
    }
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