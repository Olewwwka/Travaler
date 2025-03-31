import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Map as OlMap, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, transform } from 'ol/proj';
import { Feature } from 'ol';
import { Point as OlPoint } from 'ol/geom';
import { Style, Icon, Fill, Stroke, Circle } from 'ol/style';
import { Overlay } from 'ol';
import { Point } from './Points/points.model';
import { PointsService } from './Points/points.service';
import { RouteService } from './route.service';
import { LineString } from 'ol/geom';
import * as polyline from '@mapbox/polyline';
import { OpenRouteService } from './routes/openRoute.service';
import { MapBrowserEvent } from 'ol';
import * as L from 'leaflet';

export interface IMapService {
  showAddPointMenu(event: MouseEvent): void;
  hideAddPointMenu(): void;
  getClickedCoordinates(): [number, number] | null;
  initMap(target: HTMLElement, elements?: {
    popupElement?: HTMLElement;
    popupContentElement?: HTMLElement;
    contextMenuElement?: HTMLElement;
    addPointMenuElement?: HTMLElement;
  }, userId?: string): OlMap | null;
  addPointsToMap(points: any[]): void;
  showPointOnMap(point: any): void;
  centerMap(latitude: number, longitude: number): void;
  removePointsFromMap(): void;
  removeRouteFromMap(): void;
  drawRouteOnMap(route: any): void;
  setSelectedPoint(point: Point | null): void;
  getSelectedPoint(): Point | null;
  setClickHandler(handler: (point: Point | null) => void): void;
  getPopup(): Overlay | null;
}

@Injectable({
  providedIn: 'root'
})
export class MapService implements IMapService {
  private map: OlMap | null = null;
  private vectorLayer: VectorLayer<VectorSource> | null = null;
  private routeLayer: VectorLayer<VectorSource> | null = null;
  private vectorSource: VectorSource | null = null;
  private popup: Overlay | null = null;
  private clickedCoordinates: [number, number] | null = null;
  private contextMenu: HTMLElement | null = null;
  private addPointMenu: HTMLElement | null = null;
  private renderer: Renderer2;
  private selectedPoint: Point | null = null;
  private clickHandler: ((point: Point | null) => void) | null = null;

  private contextMenuListener?: () => void;
  private addPointMenuListener?: () => void;
  private documentClickListener?: () => void;
  private addToRouteListener?: () => void; 
  private drawRouteListener?: () => void;

  constructor(
    private pointsService: PointsService,
    private rendererFactory: RendererFactory2,
    private routeService: RouteService,
    private openRouteService: OpenRouteService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  private setupAddToRouteListener(
    popupContentElement: HTMLElement,
    feature: Feature
  ): void {
    if (this.addToRouteListener) {
      this.addToRouteListener();
    }
  
    this.addToRouteListener = this.renderer.listen(
      popupContentElement,
      'click',
      (e: Event) => {
        if ((e.target as HTMLElement).id === 'add-to-route-button') {
          const name = feature.get('name');
  
          if (name === 'Ваше местоположение') {
            const geometry = feature.getGeometry();
            if (geometry) {
              const longitude = feature.get('longitude');
              const latitude = feature.get('latitude');
              const userLocationPoint: Point = {
                name: 'Ваше местоположение',
                description: 'Текущее местоположение пользователя',
                latitude,
                longitude,
              };
  
              this.routeService.addNewPoint(userLocationPoint);
            } else {
              console.error('Геометрия не найдена у feature');
            }
          } else {
            this.pointsService.getPointByName(name).subscribe((point: Point) => {
              if (point) {
                this.routeService.addNewPoint(point); 
              } else {
                console.error('Точка не найдена');
              }
            });
          }
        }
      }
    );
  }

  setClickHandler(handler: (point: Point | null) => void): void {
    this.clickHandler = handler;
  }

  initMap(target: HTMLElement, elements?: {
    popupElement?: HTMLElement;
    popupContentElement?: HTMLElement;
    contextMenuElement?: HTMLElement;
    addPointMenuElement?: HTMLElement;
  }, userId?: string): OlMap | null {
    if (!target) {
      console.error('Target element not found');
      return null;
    }

    // Создаем слой с картой
    const osmLayer = new TileLayer({
      source: new OSM({
        attributions: [], // Убираем копирайт
      }),
    });

    // Создаем карту с настройками
    this.map = new OlMap({
      target: target,
      layers: [osmLayer],
      view: new View({
        center: fromLonLat([37.6173, 55.7558]), // Москва
        zoom: 10,
      }),
      controls: [], // Убираем все элементы управления
    });

    // Создаем слой для точек
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });
    this.map.addLayer(this.vectorLayer);

    // Инициализация попапа
    if (elements?.popupElement) {
      this.popup = new Overlay({
        element: elements.popupElement,
        positioning: 'bottom-center',
        offset: [0, -20],
        autoPan: true,
        className: 'ol-popup'
      });
      this.map.addOverlay(this.popup);
    }

    // Инициализация контекстного меню
    if (elements?.contextMenuElement) {
      this.contextMenu = elements.contextMenuElement;
      this.contextMenuListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (this.contextMenu && !this.contextMenu.contains(target)) {
          this.contextMenu.style.display = 'none';
        }
      });
    }

    // Инициализация меню добавления точки
    if (elements?.addPointMenuElement) {
      this.addPointMenu = elements.addPointMenuElement;
      this.addPointMenuListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (this.addPointMenu && !this.addPointMenu.contains(target)) {
          this.addPointMenu.style.display = 'none';
        }
      });
    }

    // Обработчик правого клика мыши
    this.map.getViewport().addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      if (!this.map || !this.contextMenu) return;

      const pixel = this.map.getEventPixel(event);
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      this.clickedCoordinates = transform(coordinate, 'EPSG:3857', 'EPSG:4326') as [number, number];
      
      this.contextMenu.style.display = 'block';
      this.contextMenu.style.left = event.pageX + 'px';
      this.contextMenu.style.top = event.pageY + 'px';
    });

    // Обработчик клика по карте
    this.map.on('singleclick', (event) => {
      let featureFound = false;

      if (!this.map) return;

      // Проверяем, не был ли клик по меню
      const target = event.originalEvent.target as HTMLElement;
      if (this.addPointMenu?.contains(target) || this.contextMenu?.contains(target)) {
        return;
      }

      this.map.forEachFeatureAtPixel(event.pixel, (featureLike) => {
        const feature = featureLike as Feature;
        const properties = feature.get('properties');
        if (!properties) return;

        const name = properties.name;
        const description = properties.description;
        const imageUrl = properties.imageUrl;
        const isUserLocation = properties.isUserLocation;
        const id = properties.id;

        if (name && description && elements?.popupContentElement) {
          const h3 = elements.popupContentElement.querySelector('h3');
          const p = elements.popupContentElement.querySelector('p');
          
          if (h3) h3.textContent = name;
          if (p) p.textContent = description;
          
          // Устанавливаем выбранную точку
          const selectedPoint: Point = {
            id,
            name,
            description,
            latitude: properties.latitude,
            longitude: properties.longitude,
            imageUrl,
            isUserLocation
          };
          this.setSelectedPoint(selectedPoint);
          
          // Вызываем кастомный обработчик
          if (this.clickHandler) {
            this.clickHandler(selectedPoint);
          }
          
          // Показываем попап
          if (this.popup) {
            this.popup.setPosition(event.coordinate);
          }
          featureFound = true;
        }
      });

      if (!featureFound && this.popup) {
        this.popup.setPosition(undefined);
        this.setSelectedPoint(null);
        // Вызываем кастомный обработчик с null
        if (this.clickHandler) {
          this.clickHandler(null);
        }
      }
    });

    // Добавляем обработчик клика по документу для закрытия меню
    this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Проверяем, что клик был вне контекстного меню и меню добавления точки
      if (this.contextMenu && !this.contextMenu.contains(target)) {
        this.contextMenu.style.display = 'none';
      }
      if (this.addPointMenu && !this.addPointMenu.contains(target)) {
        this.addPointMenu.style.display = 'none';
      }
    });

    this.addUserLocationPoint(userId);
    return this.map;
  }

  private clearForm(elements: {
    addPointMenuElement: HTMLElement;
  }): void {
    const nameInput = elements.addPointMenuElement.querySelector('#point-name') as HTMLInputElement;
    const descriptionInput = elements.addPointMenuElement.querySelector('#point-description') as HTMLTextAreaElement;
  
    if (nameInput && descriptionInput) {
      nameInput.value = '';
      descriptionInput.value = '';
    }
  }

  editFeature(feature: Feature): void {
    const name = feature.get('name');
    alert(`Редактирование точки: ${name}`);
    this.refreshMap();
  }
  
  
  removePointsFromMap(): void {
    if (this.vectorSource) {
      this.vectorSource.clear();
    }
  }

  clearPoints(): void {
    this.removePointsFromMap();
  }

  addPoint(point: Point): void {
    if (!this.vectorSource) return;

    const feature = new Feature({
      geometry: new OlPoint(fromLonLat([point.longitude, point.latitude])),
      properties: {
        id: point.id,
        name: point.name,
        description: point.description,
        latitude: point.latitude,
        longitude: point.longitude,
        imageUrl: point.imageUrl,
        isUserLocation: point.isUserLocation
      }
    });

    let style: Style;
    if (point.isUserLocation) {
      style = new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#4285F4' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      });
    } else {
      style = new Style({
        image: new Icon({
          src: '/assets/marker.png',
          scale: 0.05
        })
      });
    }

    feature.setStyle(style);
    this.vectorSource.addFeature(feature);
  }

  private refreshMap(): void {
    // Загружаем все точки заново
    this.pointsService.getAllPoints().subscribe({
      next: (points) => {
        this.addPointsToMap(points);
      },
      error: (err) => {
        console.error('Ошибка при обновлении карты:', err);
      }
    });
  }

  addPointsToMap(points: any[]): void {
    if (!this.map) return;
    
    // Создаем новый vectorSource, если его нет
    if (!this.vectorSource) {
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource
      });
      this.map.addLayer(this.vectorLayer);
    }
    
    // Очищаем все точки
    this.vectorSource.clear();

    // Добавляем новые точки
    points.forEach(point => {
      const feature = new Feature({
        geometry: new OlPoint(fromLonLat([point.longitude, point.latitude])),
        properties: {
          id: point.id,
          name: point.name,
          description: point.description,
          latitude: point.latitude,
          longitude: point.longitude,
          imageUrl: point.imageUrl,
          isUserLocation: point.isUserLocation
        }
      });

      let style: Style;
      if (point.isUserLocation) {
        style = new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: '#4285F4' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          })
        });
      } else {
        style = new Style({
          image: new Icon({
            src: '/assets/marker.png',
            scale: 0.3
          })
        });
      }

      feature.setStyle(style);
      if (this.vectorSource) {
        this.vectorSource.addFeature(feature);
      }
    });
  }

  updateMapWithNewPoint(newPoint: Point): void {
    if (!this.map) {
      console.error('Карта не инициализирована');
      return;
    }

    // Создаем новый vectorSource, если его нет
    if (!this.vectorSource) {
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource
      });
      this.map.addLayer(this.vectorLayer);
    }
  
    const isUserLocation = newPoint.name === 'Ваше местоположение';
  
    const iconStyle = new Style({
      image: new Icon({
        src: '/assets/marker.png',
        scale: 0.3
      }),
    });
  
    const createCircleStyle = (radius: number) => {
      if (!this.map || !this.map.getView()) {
        console.error('Карта или вид карты не инициализированы.');
        return new Style({}); 
      }
  
      const resolution = this.map.getView().getResolution();
      if (!resolution) {
        console.error('Не удалось получить разрешение карты.');
        return new Style({}); 
      }
  
      return new Style({
        image: new Circle({
          radius: radius / resolution,
          fill: new Fill({
            color: 'rgba(0, 128, 255, 0.3)', 
          }),
          stroke: new Stroke({
            color: 'rgba(0, 128, 255, 0.8)',
            width: 2, 
          }),
        }),
      });
    };
  
    const feature = new Feature({
      geometry: new OlPoint(fromLonLat([newPoint.longitude, newPoint.latitude])),
      name: newPoint.name,
      description: newPoint.description,
      imageUrl: newPoint.imageUrl,
      id: newPoint.id,
      isUserLocation: isUserLocation
    });
  
    if (isUserLocation) {
      const initialRadius = 500;
      const circleStyle = createCircleStyle(initialRadius);
      feature.setStyle(circleStyle);
  
      const view = this.map.getView();
      if (view) {
        view.on('change:resolution', () => {
          const updatedCircleStyle = createCircleStyle(initialRadius);
          feature.setStyle(updatedCircleStyle);
        });
      }
    } else {
      feature.setStyle(iconStyle); 
    }
  
    if (this.vectorSource) {
      this.vectorSource.addFeature(feature);
    } else {
      console.error('VectorSource не инициализирован');
    }
  }

  addUserLocationPoint(userId?: string): void {
    this.pointsService.getUserCoordinates(userId).subscribe({
      next: (coordinates) => {
        const { latitude, longitude } = coordinates;
        console.log(longitude, latitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const userLocationPoint: Point = {
            name: 'Ваше местоположение',
            description: 'Текущее местоположение пользователя',
            latitude,
            longitude,
          };
          console.log("sucsess");
          this.updateMapWithNewPoint(userLocationPoint);
        } else {
          console.warn('Некорректные координаты пользователя:', latitude, longitude);
        }
      },
      error: (err) => {
        console.error('Ошибка при получении координат пользователя:', err);
      },
    });
  }

  centerMap(latitude: number, longitude: number): void {
    if (!this.map) return;
    const view = this.map.getView();
    if (!view) return;
    
    const coordinates = fromLonLat([longitude, latitude]);
    view.setCenter(coordinates);
    view.setZoom(15);
  }


  drawRouteOnMap(route: any): void {
    if (!this.map) return;
    const view = this.map.getView();
    if (!view) {
      console.error('Не удалось получить view карты');
      return;
    }

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }

    if (!route?.routes?.[0]?.geometry) {
      console.error('Некорректные данные маршрута');
      return;
    }

    const decodedCoordinates = polyline.decode(route.routes[0].geometry);
    if (!decodedCoordinates?.length) {
      console.error('Не удалось декодировать координаты маршрута');
      return;
    }

    const routeCoordinates = decodedCoordinates.map(coord => 
      fromLonLat([coord[1], coord[0]])
    );

    const routeLine = new Feature({
      geometry: new LineString(routeCoordinates)
    });

    const vectorSource = new VectorSource({
      features: [routeLine]
    });

    this.routeLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 3
        })
      })
    });

    this.map.addLayer(this.routeLayer);

    // Центрируем карту на маршруте
    const extent = routeLine.getGeometry()?.getExtent();
    if (extent) {
      view.fit(extent, { padding: [50, 50, 50, 50] });
    }
  }

  removeRouteFromMap(): void {
    if (!this.routeLayer || !this.map) return;
    this.map.removeLayer(this.routeLayer);
    this.routeLayer = null;
  }

  showAddPointMenu(event?: MouseEvent): void {
    if (!this.addPointMenu) return;

    if (event) {
      if (!this.contextMenu || !this.map) return;
      
      const mapCoordinate = this.map.getEventCoordinate(event);
      if (!mapCoordinate) return;
      
      // Получаем позицию кнопки относительно viewport
      const button = event.target as HTMLElement;
      const rect = button.getBoundingClientRect();
      
      this.contextMenu.style.display = 'none';
      
      // Позиционируем меню так, чтобы оно не выходило за пределы экрана
      const menuWidth = 300; // Примерная ширина меню
      const menuHeight = 200; // Примерная высота меню
      const padding = 10; // Отступ от края экрана
      
      let left = rect.left;
      let top = rect.bottom + 5; // Небольшой отступ от кнопки
      
      // Проверяем, не выходит ли меню за правый край экрана
      if (left + menuWidth > window.innerWidth - padding) {
        left = window.innerWidth - menuWidth - padding;
      }
      
      // Проверяем, не выходит ли меню за нижний край экрана
      if (top + menuHeight > window.innerHeight - padding) {
        top = rect.top - menuHeight - 5; // Показываем меню над кнопкой
      }
      
      this.addPointMenu.style.left = `${left}px`;
      this.addPointMenu.style.top = `${top}px`;
      this.addPointMenu.style.display = 'block';
      
      this.clickedCoordinates = transform(mapCoordinate, 'EPSG:3857', 'EPSG:4326') as [number, number];
    } else {
      this.addPointMenu.style.display = 'block';
      this.addPointMenu.style.left = '50%';
      this.addPointMenu.style.top = '50%';
      this.addPointMenu.style.transform = 'translate(-50%, -50%)';
    }
  }

  hideAddPointMenu(): void {
    if (this.addPointMenu) {
      this.addPointMenu.style.display = 'none';
    }
  }

  getClickedCoordinates(): [number, number] | null {
    return this.clickedCoordinates;
  }

  showPointOnMap(point: any): void {
    if (!this.map) return;
    const view = this.map.getView();
    if (!view) return;
    
    const coordinates = fromLonLat([point.longitude, point.latitude]);
    view.setCenter(coordinates);
    view.setZoom(15);
  }

  setSelectedPoint(point: Point | null): void {
    this.selectedPoint = point;
  }

  getSelectedPoint(): Point | null {
    return this.selectedPoint;
  }

  getPopup(): Overlay | null {
    return this.popup;
  }
}