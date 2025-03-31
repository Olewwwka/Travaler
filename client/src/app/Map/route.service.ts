import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Point } from './Points/points.model';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private routePoints: Point[] = [
    {
      id: '',
      latitude: -1,
      longitude: -1,
      name: '',
      description: '',
    },
    {
      id: '',
      latitude: -1,
      longitude: -1,
      name: '',
      description: '',
    },
  ];

  private routePointsSubject = new BehaviorSubject<Point[]>(this.routePoints);
  routePoints$ = this.routePointsSubject.asObservable();

  constructor() {}

  getRoutePoints(): Point[] {
    return this.routePoints;
  }

  addPoint(): void {
    this.routePoints.push({
      id: '',
      latitude: -1,
      longitude: -1,
      name: '',
      description: '',
    });
    this.routePointsSubject.next(this.routePoints); 
  }

  addNewPoint(point: Point): void {
    if (this.routePoints[0]?.id === '') {
      this.routePoints[0] = point;
    }
    else if (this.routePoints[1]?.id === '') {
      this.routePoints[1] = point;
    }
    else {
      const emptyIndex = this.routePoints.findIndex(p => p.id === '');
      if (emptyIndex !== -1) {
        this.routePoints[emptyIndex] = point; 
      } else {
        this.routePoints.push(point); 
      }
    }
  
    this.routePointsSubject.next([...this.routePoints]);
  }

  removePoint(index: number): void {
    if (this.routePoints.length > 2) {
      this.routePoints.splice(index, 1);
      this.routePointsSubject.next(this.routePoints); 
    }
  }

  updatePoint(index: number, updatedPoint: Point): void {
    this.routePoints[index] = updatedPoint;
    this.routePointsSubject.next(this.routePoints); 
  }

  movePointUp(index: number): void {
    if (index > 0) {
      const temp = this.routePoints[index];
      this.routePoints[index] = this.routePoints[index - 1];
      this.routePoints[index - 1] = temp;
      this.routePointsSubject.next(this.routePoints); 
    }
  }

  movePointDown(index: number): void {
    if (index < this.routePoints.length - 1) {
      const temp = this.routePoints[index];
      this.routePoints[index] = this.routePoints[index + 1];
      this.routePoints[index + 1] = temp;
      this.routePointsSubject.next(this.routePoints); 
    }
  }

  saveRoute(): void {
    console.log('Сохранить маршрут:', this.routePoints);
  }
}