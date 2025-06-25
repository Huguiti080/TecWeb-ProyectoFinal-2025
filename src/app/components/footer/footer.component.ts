import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Importa FontAwesomeModule
import { signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true, // Asegúrate de tener esto si es un componente standalone
  imports: [FontAwesomeModule], // Agrega FontAwesomeModule al array imports
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  usuariosConectados = signal(this.getRandomUsuarios());

  constructor() {
    setInterval(() => {
      this.usuariosConectados.set(this.getRandomUsuarios());
    }, 5000); // Actualiza cada 5 segundos
  }

  getRandomUsuarios(): number {
    return Math.floor(Math.random() * 71) + 50; // 50 a 120
  }
}