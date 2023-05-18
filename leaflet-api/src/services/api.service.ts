import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ci_vettore } from 'src/models/ci_vettore.model';
import { CircleGeometry } from 'src/models/circleGeometries.model';
import { Geometry } from 'src/models/geometry.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseEndpoint: string = "http://127.0.0.1:5000";

  constructor(private http: HttpClient) { }

  getVettore(page: number): Observable<Ci_vettore[]> {
    return this.http.get<Ci_vettore[]>(`${this.baseEndpoint}/ci_vettore/${page}`)
  }

  getPointsInCircle(radius: number, lat: number, lng: number): Observable<Ci_vettore[]> {
    return this.http.get<Ci_vettore[]>(`${this.baseEndpoint}/sphere?radius=${radius}&lat=${lat}&lng=${lng}`)
  }

  getPolygons(page: number = -1): Observable<Geometry[]> {
    return this.http.get<Geometry[]>(`${this.baseEndpoint}/geogeom?page=${page}`) 
  }

  getPolygonsInCircle(radius: number, lat: number, lng: number): Observable<CircleGeometry> {
    return this.http.get<CircleGeometry>(`${this.baseEndpoint}/geogeom?radius=${radius}&lat=${lat}&lng=${lng}`) 
  }

  getAllPolygons(): Observable<Geometry[]> {
    return this.http.get<Geometry[]>(`${this.baseEndpoint}/geogeom`);
  }
}
