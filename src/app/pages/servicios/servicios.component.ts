import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

  constructor(private fb: FormBuilder) {
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

  guardar() {
    if (this.formulario.valid) {
      const datos = this.formulario.value;
      console.log(datos);

      // Guardamos en localStorage
      const registros = JSON.parse(localStorage.getItem('registros') || '[]');
      registros.push(datos);
      localStorage.setItem('registros', JSON.stringify(registros));

      // Alerta bonita con SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Formulario enviado',
        text: '¡Los datos han sido registrados!',
        confirmButtonColor: '#3085d6'
      });

      this.formulario.reset();
    }
  }
}