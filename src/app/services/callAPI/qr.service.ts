import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QRService {
  private apiUrl = 'http://localhost:3000/api/qr';

  constructor(private http: HttpClient) {}

  getDatosQr(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
