import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { ApiService } from 'src/services/api.service';

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

  constructor(private api: ApiService) {}

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

    this.api.getVettore(50).subscribe((data) => {
      data.forEach((e) => {
        const marker = new L.Marker([e.WGS84_X, e.WGS84_Y])
          .bindPopup(e.INDIRIZZO)
          .setIcon(this.findImage(e.CI_VETTORE));
        marker.addTo(this.map);
      });
    });

    tiles.addTo(this.map);
  }

  ngAfterViewInit(): void {
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
}
