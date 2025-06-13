import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  modoSeleccion = false;
  tipo: 'registro' | 'contacto' | null = null;

  registros: any[] = [];
  modoEdicion: boolean = false;
  registroEditado: any = {};
  indexEditando: number = -1;

  constructor(private router: Router) {}

  ngOnInit() {
    this.modoSeleccion = false;
    this.tipo = null;
  }

  verTipo(tipoSeleccionado: 'registro' | 'contacto') {
    if (tipoSeleccionado === 'contacto') {
      // Redirigir a la página de registros de contacto
      this.router.navigate(['/contactoregistro']);
      return;
    }

    this.tipo = tipoSeleccionado;
    this.modoSeleccion = true;

    const data = localStorage.getItem('registros');
    this.registros = data ? JSON.parse(data) : [];
  }

  volver() {
    this.modoSeleccion = false;
    this.tipo = null;
    this.modoEdicion = false;
    this.indexEditando = -1;
  }

  eliminarRegistro(index: number) {
    this.registros.splice(index, 1);
    localStorage.setItem('registros', JSON.stringify(this.registros));
  }

  editarRegistro(index: number) {
    this.indexEditando = index;
    this.registroEditado = { ...this.registros[index] };
    this.modoEdicion = true;
  }

  guardarEdicion() {
    if (this.indexEditando !== -1) {
      this.registros[this.indexEditando] = this.registroEditado;
      localStorage.setItem('registros', JSON.stringify(this.registros));
      this.cancelarEdicion();
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.indexEditando = -1;
    this.registroEditado = {};
  }
}
