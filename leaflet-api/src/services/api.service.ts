import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ci_vettore } from 'src/models/ci_vettore.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseEndpoint: string = "http://127.0.0.1:5000";

  constructor(private http: HttpClient) { }

  getVettore(page: number): Observable<Ci_vettore[]> {
    return this.http.get<Ci_vettore[]>(`${this.baseEndpoint}/ci_vettore/${page}`)
  }
}
