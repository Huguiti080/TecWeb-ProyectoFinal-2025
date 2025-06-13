import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  carouselSlides = [
    {
      image: 'assets/imagenes/ZonaCardio.jpg',
      alt: 'Área de cardio',
      title: 'Zona de Cardio',
      description: 'Equipamiento cardiovascular de última generación.'
    },
    {
      image: 'assets/imagenes/ZonaFuerza.png',
      alt: 'Área de pesas',
      title: 'Zona de Fuerza',
      description: 'Amplia selección de pesas libres para todos los niveles.'
    },
    {
      image: 'assets/imagenes/ClasesGrupales.jpg',
      alt: 'Clases grupales',
      title: 'Clases Grupales',
      description: 'Variedad de clases dirigidas por profesionales certificados.'
    },
    {
      image: 'assets/imagenes/ofertas.png',
      alt: 'Ofertas',
      title: 'Ofertas',
      description: 'Deja atrás la rutina y abraza tu mejor versión. ¡Oferta limitada en membresías!'
    },
    {
      image: 'assets/imagenes/Planes.png',
      alt: 'Planes de membresias',
      title: 'Nuestros PLanes',
      description: 'Encuentra tu ritmo y alcanza tus metas con nuestros diferentes planes de membresía.'
    }
  ];

  currentSlide = 0;
  autoSlideInterval: any;
  
  constructor() { }

  ngOnInit(): void {
    // Iniciar el autoplay del carrusel
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando se destruye el componente
    this.stopAutoSlide();
  }

  // Métodos para controlar el carrusel
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
    this.resetAutoSlide();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.carouselSlides.length) % this.carouselSlides.length;
    this.resetAutoSlide();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  // Autoplay del carrusel
  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambia de slide cada 5 segundos
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  resetAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

}