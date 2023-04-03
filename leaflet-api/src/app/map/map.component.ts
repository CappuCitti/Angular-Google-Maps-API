import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  private map: any;

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.464211, 9.191383],
      zoom: 14,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    const marker = new L.Marker([45.464211, 9.191383])
      .bindPopup('UGO')
      .setIcon(L.icon({ iconUrl: '/assets/cat.ico', iconSize: [64, 64] }));
    marker.addTo(this.map);

    const rectangle = new L.Polygon([
      [45.464211, 9.191383],
      [45.464211, 9.120383],
      [45.474211, 9.120383],
      [45.474211, 9.191383],
    ]).setStyle({ fillColor: '#ddb52c', color: 'purple' });
    rectangle.addTo(this.map);

    const circle = L.circle([45.464211, 9.191383], 100, { color: 'green' });
    circle.addTo(this.map);

    const center = { lat: 45.464211, lng: 9.191383 };
    const triangle = L.polygon([
      [center.lat + 0.001, center.lng - 0.002],
      [center.lat, center.lng],
      [center.lat - 0.001, center.lng - 0.002],
    ]);
    triangle.addTo(this.map);

    tiles.addTo(this.map);
  }

  constructor() {}

  ngAfterViewInit(): void {
    this.initMap();
  }
}
