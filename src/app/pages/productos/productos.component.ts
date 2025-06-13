import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,   
  imports: [CommonModule, FormsModule],  
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  terminoBusqueda: string = '';
  busquedaRealizada: boolean = false;
  loading: boolean = true;
  error: string | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.products || [];
        this.productosFiltrados = [...this.productos];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar productos.';
        this.loading = false;
      }
    });
  }

  buscarProducto(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.busquedaRealizada = true;

    this.productosFiltrados = this.productos.filter(producto =>
      producto.name.toLowerCase().includes(termino) ||
      producto.description.toLowerCase().includes(termino)
    );
  }
}
