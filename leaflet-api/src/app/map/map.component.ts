import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
// import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import * as esri from 'esri-leaflet';
const { parse } = require('wkt');
import { ApiService } from 'src/services/api.service';
import { Feature } from 'src/models/circleGeometries.model';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  private map: any;
  private markers: Array<L.Marker> = [];
  private zones: Array<L.Polygon> = [];

  constructor(private api: ApiService) {}

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.464211, 9.191383],
      zoom: 14,
      pmIgnore: false,
    });

    this.map.pm.addControls({
      drawCircle: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
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

    this.map.on('pm:create', ({ layer }: any) => {
      layer.on('pm:edit', (e: any) => {
        var radius = layer._mRadius;
        var lat = layer._latlng.lat;
        var lng = layer._latlng.lng;
        this.changeCirclePoints(radius, lat, lng);
        console.log(radius);
      });
      layer.on('pm:remove', (e: any) => {
        this.markers.forEach((marker) => this.map.removeLayer(marker));
        this.markers = [];
        this.zones.forEach((zone) => this.map.removeLayer(zone));
        this.zones = [];
      });

      var radius = layer.options.radius;
      var lat = layer._latlng.lat;
      var lng = layer._latlng.lng;
      this.changeCirclePoints(radius, lat, lng);
    });

    this.changePoints({ target: { value: 50 } });

    tiles.addTo(this.map);
  }

  ngAfterViewInit(): void {
    // Get all Polygons
    // this.api.getAllPolygons().subscribe((data) => {
    //   data.forEach((e) => {
    //     const zone = new L.Polygon(this.polygonString2Array(e.WKT)).setStyle({
    //       color: e.color,
    //       // "weight": 0,
    //       "fillOpacity": .75
    //     });

    //     this.zones.push(zone);
    //     zone.addTo(this.map);
    //   });
    // });

    this.initMap();
  }

  findImage(label: string): L.Icon {
    if (label.includes('Gas')) {
      return L.icon({
        iconRetinaUrl: 'assets/fire.png',
        iconUrl: 'assets/fire.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('elettrica')) {
      return L.icon({
        iconRetinaUrl: 'assets/electricity.png',
        iconUrl: 'assets/electricity.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('Gasolio')) {
      return L.icon({
        iconRetinaUrl: 'assets/oil.png',
        iconUrl: 'assets/oil.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('Teleriscaldamento')) {
      return L.icon({
        iconRetinaUrl: 'assets/tvb.png',
        iconUrl: 'assets/tvb.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('GPL')) {
      return L.icon({
        iconRetinaUrl: 'assets/gpl.png',
        iconUrl: 'assets/gpl.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('Biomasse solide')) {
      return L.icon({
        iconRetinaUrl: 'assets/solid_biomass.png',
        iconUrl: 'assets/solid_biomass.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    if (label.includes('Biomasse liquide')) {
      return L.icon({
        iconRetinaUrl: 'assets/liquid_biomass.png',
        iconUrl: 'assets/liquid_biomass.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    }
    //Se non viene riconosciuta nessuna etichetta ritorna l'icona undefined
    return iconDefault;
  }

  changePoints(event: any) {
    const value = event.target.value;

    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];

    this.zones.forEach((marker) => this.map.removeLayer(marker));
    this.zones = [];

    this.api.getVettore(value).subscribe((data) => {
      data.forEach((e) => {
        const marker = new L.Marker([e.WGS84_X, e.WGS84_Y])
          .bindPopup(e.INDIRIZZO)
          .setIcon(this.findImage(e.CI_VETTORE));
        marker.addTo(this.map);
        this.markers.push(marker);
      });

      this.map.panTo(this.findAverage());
    });

    this.api.getPolygons(value).subscribe((data) => {
      data.forEach((e) => {
        const zone = new L.Polygon(this.polygonString2Array(e.WKT)).setStyle({
          color: e.color,
          // "weight": 0,
          "fillOpacity": .75
        });

        this.zones.push(zone);
        zone.addTo(this.map);
      });
    });
  }

  findAverage(): L.LatLng {
    let X =
      this.markers
        .map((m) => m.getLatLng().lat)
        .reduce((sum, marker) => {
          return sum + marker;
        }, 0) / this.markers.length;
    let Y =
      this.markers
        .map((m) => m.getLatLng().lng)
        .reduce((sum, marker) => {
          return sum + marker;
        }, 0) / this.markers.length;

    return new L.LatLng(X, Y);
  }

  changeCirclePoints(radius: number, lat: number, lng: number) {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];

    this.zones.forEach((marker) => this.map.removeLayer(marker));
    this.zones = [];

    this.api.getPointsInCircle(radius, lng, lat).subscribe((data) => {
      data.forEach((e) => {
        const marker = new L.Marker([e.WGS84_X, e.WGS84_Y])
          .bindPopup(e.INDIRIZZO)
          .setIcon(this.findImage(e.CI_VETTORE));
        marker.addTo(this.map);
        this.markers.push(marker);
      });

      this.map.panTo(this.findAverage());
    });

    this.api.getPolygonsInCircle(radius, lng, lat).subscribe((data) => {
      data.features.forEach((e: Feature) => {
        var leafletCoordinates = e.geometry.coordinates[0].map(function(coord : any) {
          return L.latLng(coord[1], coord[0]);
        });

        const zone = new L.Polygon(leafletCoordinates).setStyle({
          color: e.properties.color,
          // "weight": 0,
          "fillOpacity": .75
        });

        this.zones.push(zone);
        zone.addTo(this.map);
      });
    });
  }

  polygonString2Array(polygon: string) {
    // Rimuovi le parti non necessarie dalla stringa
    const cleanedString = polygon.replace('POLYGON ((', '').replace('))', '');

    // Dividi la stringa in un array di punti
    // const pointsArray = cleanedString.split('. '); // old
    const pointsArray = cleanedString.split(', ');

    // Crea un array di array di punti
    const polygonArray = pointsArray.map((point) => {
      const [x, y] = point.split(' ');
      return new L.LatLng(parseFloat(y), parseFloat(x));
    });

    return polygonArray;
  }
}
