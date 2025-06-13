import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomseguroPipe } from '../../pipes/domseguro.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, DomseguroPipe],
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent {

  videoId: string = 'tUykoP30Gb0';
  
  faqs = [
    {
      question: '¿Puedo cambiar de plan más tarde?',
      answer: 'Sí, puedes cambiar entre planes en cualquier momento desde tu panel de configuración.'
    },
    {
      question: '¿Hay un límite en el número de usuarios?',
      answer: 'El plan Básico permite hasta 3 usuarios, el Profesional hasta 10 y el Empresa usuarios ilimitados.'
    },
    {
      question: '¿Ofrecen descuentos para organizaciones sin fines de lucro?',
      answer: 'Sí, ofrecemos un 30% de descuento para organizaciones sin fines de lucro verificadas.'
    }
  ];
}