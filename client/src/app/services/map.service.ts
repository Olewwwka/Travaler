import { Injectable } from '@angular/core';
import { Map, View, Overlay } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, transform } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

export interface IMapService {
  showAddPointMenu(event: MouseEvent): void;
  hideAddPointMenu(): void;
  getClickedCoordinates(): [number, number] | null;
  initMap(target: HTMLElement, elements?: {
    popupElement?: HTMLElement;
    popupContentElement?: HTMLElement;
    contextMenuElement?: HTMLElement;
    addPointMenuElement?: HTMLElement;
  }, userId?: string): void;
  addPointsToMap(points: any[]): void;
  showPointOnMap(point: any): void;
  centerMap(latitude: number, longitude: number): void;
  removePointsFromMap(): void;
  removeRouteFromMap(): void;
  drawRouteOnMap(route: any): void;
}

@Injectable({
  providedIn: 'root'
})
export class MapService implements IMapService {
  private map: Map | null = null;
  private vectorLayer: VectorLayer<any> | null = null;
  private routeLayer: VectorLayer<any> | null = null;
  private vectorSource: VectorSource | null = null;
  private popup: Overlay | null = null;
  private clickedCoordinates: [number, number] | null = null;
  private contextMenu: HTMLElement | null = null;
  private addPointMenu: HTMLElement | null = null;

  initMap(target: HTMLElement, elements?: {
    popupElement?: HTMLElement;
    popupContentElement?: HTMLElement;
    contextMenuElement?: HTMLElement;
    addPointMenuElement?: HTMLElement;
  }, userId?: string) {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([37.6173, 55.7558]), // Москва
        zoom: 10
      })
    });

    if (elements?.popupElement) {
      this.popup = new Overlay({
        element: elements.popupElement,
        positioning: 'bottom-center',
        offset: [0, -20],
        autoPan: true
      });
      this.map.addOverlay(this.popup);
    }

    if (elements?.contextMenuElement) {
      this.contextMenu = elements.contextMenuElement;
    }

    if (elements?.addPointMenuElement) {
      this.addPointMenu = elements.addPointMenuElement;
    }

    // Обработчик правого клика для показа контекстного меню
    if (this.map) {
      this.map.getViewport().addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (!this.map || !this.contextMenu) return;

        const pixel = this.map.getEventPixel(event);
        const coordinate = this.map.getCoordinateFromPixel(pixel);
        this.clickedCoordinates = transform(coordinate, 'EPSG:3857', 'EPSG:4326') as [number, number];
        
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
      });

      // Скрываем контекстное меню при клике на карту
      this.map.on('click', () => {
        if (this.contextMenu) {
          this.contextMenu.style.display = 'none';
        }
        if (this.addPointMenu) {
          this.addPointMenu.style.display = 'none';
        }
      });
    }
  }

  public showAddPointMenu(event: MouseEvent): void {
    if (!this.addPointMenu || !this.clickedCoordinates) return;
    
    this.addPointMenu.style.display = 'block';
    this.addPointMenu.style.left = `${event.pageX}px`;
    this.addPointMenu.style.top = `${event.pageY}px`;
  }

  public hideAddPointMenu(): void {
    if (!this.addPointMenu) return;
    this.addPointMenu.style.display = 'none';
  }

  public getClickedCoordinates(): [number, number] | null {
    return this.clickedCoordinates;
  }

  addPointsToMap(points: any[]): void {
    if (!this.vectorSource || !this.map) return;
    
    this.vectorSource.clear();

    points.forEach(point => {
      if (!this.vectorSource) return;

      const feature = new Feature({
        geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        name: point.name,
        description: point.description
      });

      const style = new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.5
        })
      });

      feature.setStyle(style);
      this.vectorSource.addFeature(feature);
    });
  }

  showPointOnMap(point: any): void {
    if (!this.map) return;
    
    const coordinates = fromLonLat([point.longitude, point.latitude]);
    this.map.getView().setCenter(coordinates);
    this.map.getView().setZoom(15);
  }

  centerMap(latitude: number, longitude: number) {
    if (!this.map) {
      console.error('Карта не инициализирована.');
      return;
    }
    this.map.getView().setCenter(fromLonLat([longitude, latitude]));
    this.map.getView().setZoom(15);
  }

  removePointsFromMap() {
    if (!this.vectorSource) {
      console.error('Векторный слой не инициализирован.');
      return;
    }
    this.vectorSource.clear();
  }

  removeRouteFromMap() {
    // Реализация удаления маршрута
  }

  drawRouteOnMap(route: any) {
    // Реализация отрисовки маршрута
  }
} 