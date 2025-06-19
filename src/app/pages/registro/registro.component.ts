// registro.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent implements OnInit {
  /* ---------- variables de la UI ---------- */
  modoSeleccion = false;
  tipo: 'registro' | 'contacto' | null = null;

  registros: any[] = [];            // documentos de la colección “registros”
  modoEdicion = false;              // muestra/oculta el formulario de edición
  registroEditado: any = {};        // copia editable del documento seleccionado
  indexEditando = -1;               // posición del documento en el array

  constructor(private router: Router, private firestore: Firestore) {}

  /* ---------- carga inicial ---------- */
  ngOnInit(): void {
    this.modoSeleccion = false;
    this.tipo = null;
  }

  /* ---------- menú principal ---------- */
  verTipo(tipoSel: 'registro' | 'contacto'): void {
    /* si eligió “contacto”, redirigimos al componente contactoregistro */
    if (tipoSel === 'contacto') {
      this.router.navigate(['/contactoregistro']);
      return;
    }

    /* si eligió “registro”, cargamos desde Firestore */
    this.tipo = 'registro';
    this.modoSeleccion = true;
    const colRef = collection(this.firestore, 'registros');

    /* collectionData → observable; nos suscribimos para recibir la lista                 *
     *   idField:'id' añade el id del documento (lo usaremos para editar/eliminar) */
    collectionData(colRef, { idField: 'id' }).subscribe((data) => {
      this.registros = data;
    });
  }

  volver(): void {
    this.modoSeleccion = false;
    this.tipo = null;
    this.modoEdicion = false;
    this.indexEditando = -1;
  }

  /* ---------- eliminar documento ---------- */
  async eliminarRegistro(index: number): Promise<void> {
    const reg = this.registros[index];
    if (!reg?.id) return;                           // seguridad
    await deleteDoc(doc(this.firestore, 'registros', reg.id));
    // La suscripción a collectionData se encarga de refrescar this.registros
  }

  /* ---------- editar documento ---------- */
  editarRegistro(index: number): void {
    this.indexEditando = index;
    this.registroEditado = { ...this.registros[index] }; // clon
    this.modoEdicion = true;
  }

  /* ---------- guardar cambios ---------- */
  async guardarEdicion(): Promise<void> {
    if (this.indexEditando === -1) return;
    const reg = this.registroEditado;
    await updateDoc(doc(this.firestore, 'registros', reg.id), {
      nombre: reg.nombre,
      correo: reg.correo,
      telefono: reg.telefono,
      servicio: reg.servicio,
    });
    this.cancelarEdicion(); // la lista se actualiza sola por collectionData
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.indexEditando = -1;
    this.registroEditado = {};
  }
}
