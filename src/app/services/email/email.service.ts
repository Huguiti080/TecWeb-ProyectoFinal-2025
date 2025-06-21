import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private apiUrl = 'http://localhost:3000/api/enviar-correo'; 

  constructor(private http: HttpClient) {}

  enviarCorreo(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}
