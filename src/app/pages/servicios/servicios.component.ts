import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent {
  formulario: FormGroup;

  constructor(private fb: FormBuilder, private firestore: Firestore) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      servicio: ['', Validators.required]
    });
  }

  mostrarError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async guardar() {
    if (this.formulario.valid) {
      const datos = this.formulario.value;
      console.log(datos);

      try {
        // Guardamos en Firebase Firestore
        await addDoc(collection(this.firestore, 'registros'), datos);

        Swal.fire({
          icon: 'success',
          title: 'Formulario enviado',
          text: '¡Los datos han sido registrados en Firebase!',
          confirmButtonColor: '#3085d6'
        });

        this.formulario.reset();
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar los datos.',
          confirmButtonColor: '#d33'
        });
      }
    }
  }
}
