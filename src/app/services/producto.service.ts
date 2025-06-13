import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root', 
})
export class ProductoService {

  private apiUrl = 'https://miniproyecto-productos-gym.free.beeceptor.com/productos-api'; 

  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get<any>(this.apiUrl);
  }
}
