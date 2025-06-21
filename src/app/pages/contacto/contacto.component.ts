import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { EmailService } from '../../services/email/email.service';
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

constructor(private firestore: Firestore, private emailService: EmailService) {}

  esFechaAnterior(): boolean {
    if (!this.contacto.fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const seleccionada = new Date(this.contacto.fecha);
    seleccionada.setHours(0, 0, 0, 0);
    return seleccionada < hoy;
  }

  async enviarFormulario(form: NgForm) {
    if (form.valid && !this.esFechaAnterior()) {
      try {
        const contactoConFecha = {
          ...this.contacto,
          fechaEnvio: new Date()
        };

        await addDoc(collection(this.firestore, 'contacto'), contactoConFecha);

        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: '¡Gracias por contactarnos!',
          confirmButtonColor: '#f0ad4e'
        });

        form.resetForm();
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el mensaje. Intenta más tarde.',
          confirmButtonColor: '#d33'
        });
      }
    }
  }
}
