import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Importa FontAwesomeModule

@Component({
  selector: 'app-footer',
  standalone: true, // Asegúrate de tener esto si es un componente standalone
  imports: [FontAwesomeModule], // Agrega FontAwesomeModule al array imports
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

}