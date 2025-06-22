import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Registro {
  id?: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class QRService {
  private apiUrl = 'http://localhost:3000/api/registros'; // URL de tu backend

  constructor(private http: HttpClient) {}

  getTodosLosRegistros(): Observable<Registro[]> {
    return this.http.get<Registro[]>(this.apiUrl);
  }

  getRedSocialActiva(): Observable<{ redSocialActiva: string; url: string }> {
  return this.http.get<{ redSocialActiva: string; url: string }>('http://localhost:3000/api/redsocial');
}

}
