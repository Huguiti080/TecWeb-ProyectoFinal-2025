import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {
  contacto = {
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: '',
    motivo: '',
    urgencia: '',
    fecha: ''
  };

  motivos: string[] = [
    'Consulta general',
    'Problema con membresía',
    'Sugerencia',
    'Reclamo',
    'Otro'
  ];

  // Fecha mínima (hoy)
  fechaMinima: string = new Date().toISOString().split('T')[0];

  esFechaAnterior(): boolean {
    if (!this.contacto.fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const seleccionada = new Date(this.contacto.fecha);
    seleccionada.setHours(0, 0, 0, 0);
    return seleccionada < hoy;
  }

  enviarFormulario(form: NgForm) {
    if (form.valid && !this.esFechaAnterior()) {
      console.log('Mensaje enviado:', this.contacto);

      const mensajes = JSON.parse(localStorage.getItem('mensajesContacto') || '[]');
      mensajes.push(this.contacto);
      localStorage.setItem('mensajesContacto', JSON.stringify(mensajes));

      Swal.fire({
        icon: 'success',
        title: 'Mensaje enviado',
        text: '¡Gracias por contactarnos!',
        confirmButtonColor: '#f0ad4e'
      });

      form.resetForm();
    }
  }
}