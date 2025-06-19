import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-contactoregistro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contactoregistro.component.html',
  styleUrl: './contactoregistro.component.css'
})
export class ContactoregistroComponent implements OnInit {
  mensajes: any[] = [];
  modoEdicion: boolean = false;
  mensajeEditando: any = null;
  indexEditando: number = -1;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const coleccion = collection(this.firestore, 'contacto');
    collectionData(coleccion, { idField: 'id' }).subscribe(data => {
      this.mensajes = data;
    });
  }

  eliminarMensaje(index: number) {
    const mensaje = this.mensajes[index];
    if (!mensaje?.id) return;

    const ref = doc(this.firestore, 'contacto', mensaje.id);
    deleteDoc(ref).then(() => {
      this.mensajes.splice(index, 1);
    });
  }

  editarMensaje(index: number) {
    this.mensajeEditando = { ...this.mensajes[index] };
    this.modoEdicion = true;
    this.indexEditando = index;
  }

  guardarCambios() {
    const mensaje = this.mensajeEditando;
    if (!mensaje?.id) return;

    const ref = doc(this.firestore, 'contacto', mensaje.id);
    updateDoc(ref, {
      nombre: mensaje.nombre,
      correo: mensaje.correo,
      telefono: mensaje.telefono,
      mensaje: mensaje.mensaje
    }).then(() => {
      this.mensajes[this.indexEditando] = mensaje;
      this.cancelarEdicion();
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.mensajeEditando = null;
    this.indexEditando = -1;
  }
}
