import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactoregistro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contactoregistro.component.html',
  styleUrl: './contactoregistro.component.css'
})
export class ContactoregistroComponent {
  mensajes: any[] = [];
  modoEdicion: boolean = false;
  mensajeEditando: any = null;
  indexEditando: number = -1;

  ngOnInit() {
    const datos = localStorage.getItem('mensajesContacto');
    this.mensajes = datos ? JSON.parse(datos) : [];
  }

  eliminarMensaje(index: number) {
    this.mensajes.splice(index, 1);
    localStorage.setItem('mensajesContacto', JSON.stringify(this.mensajes));
  }

  editarMensaje(index: number) {
    this.mensajeEditando = { ...this.mensajes[index] };
    this.modoEdicion = true;
    this.indexEditando = index;
  }

  guardarCambios() {
    if (this.indexEditando !== -1) {
      this.mensajes[this.indexEditando] = this.mensajeEditando;
      localStorage.setItem('mensajesContacto', JSON.stringify(this.mensajes));
      this.cancelarEdicion();
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.mensajeEditando = null;
    this.indexEditando = -1;
  }
}