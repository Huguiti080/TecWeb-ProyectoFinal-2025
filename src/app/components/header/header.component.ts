import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component'; 
import { CommonModule } from '@angular/common';
import { AppUser } from '../../services/auth/auth-interfaces';
//import { LoginComponent } from "../login/login.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavbarComponent, CommonModule,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Recibe el usuario desde AppComponent
 // Actualizar el input
@Input() user: AppUser | null = null;

  

  // Transmite eventos desde el Navbar al AppComponent
  @Output() menuItemClicked = new EventEmitter<string>();
  @Output() loginRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  // Maneja eventos del navbar
  handleNavbarEvent(event: { type: string, data?: any }) {
    switch(event.type) {
      case 'menuItemClicked':
        this.menuItemClicked.emit(event.data);
        break;
      case 'loginRequested':
        this.loginRequested.emit();
        break;
      case 'logoutRequested':
        this.logoutRequested.emit();
        break;
    }
  }
  menuVisible = false;
toggleMenu() {
  this.menuVisible = !this.menuVisible;
}


synth = window.speechSynthesis;
utterance = new SpeechSynthesisUtterance("Unidos por la fuerza, imparables en el proceso. Inicio. Planes. Clases. Productos. Registrate. Contacto. QR. En el fondo, un hombre y una mujer realizando levantamiento de pesas. ¡Bienvenidos! La Máquina eres TÚ. ¡ÚNETE AHORA!. Clases grupales. Entrenamiento personal. Nutrición. Forza Unity. Unidos por la fuerza, imparables en el proceso. En Forza Unity creemos en el poder transformador del ejercicio físico y la disciplina. Nuestro gimnasio está diseñado para que encuentres todas las herramientas necesarias para alcanzar tus objetivos fitness, sin importar tu nivel de experiencia. Contamos con equipamiento de última generación, espacios amplios y luminosos, y un equipo de profesionales dedicados a guiarte en cada paso de tu entrenamiento. Nuestra comunidad está formada por personas comprometidas que se apoyan mutuamente para superar sus límites. Más que un gimnasio, somos una familia unida por el compromiso con la salud y el bienestar. Nuestras Instalaciones. Imagen de varias maquinas de cardio en fila. Zona de Cardio. Equipamiento cardiovascular de ultima generacion. Imagen de un espacio amplio de zona de pesas. Zona de fuerza. Amplia seleccion de pesas libres para todos los niveles. Imagen de un grupo realizando ejercicios dirigidos por un profesor. Clases grupales. Variedad de clases dirigidas por profesionales certificados. Imagen de una oferta del 50 por ciento de descuento. Ofertas. Deja atras la rutina y abraza tu mejor version. Oferta limitada en membresias. Imagen de las membresias del gimnasio. Nuestros Planes. Encuentra tu ritmo y alcanza tus metas con nuestros diferentes planes de membresia. Equipamiento de Última Generación. Entrena con lo mejor en máquinas y accesorios para maximizar tus resultados. Entrenadores Certificados. Nuestro equipo de profesionales te guiará en cada paso de tu camino fitness. Horarios Flexibles. Abierto de lunes a domingo con horarios que se adaptan a tu rutina. Lo que dicen nuestros miembros. Increíbles instalaciones y excelente atención. He logrado mis objetivos en tiempo récord. - Carlos M. Las clases grupales son energéticas y motivadoras. ¡No puedo dejar de asistir! - Ana P. ¡COMIENZA TU TRANSFORMACIÓN HOY! Primera sesión completamente gratis. PROGRAMA TU VISITA.");

startSpeech() {
  this.stopSpeech(); 
  this.synth.speak(this.utterance);
}
pausa= true;
pauseSpeech() {
  if(this.pausa){
    this.synth.pause();
    this.pausa=false;
  }else{
    this.synth.resume();
    this.pausa=true;
  }
}

stopSpeech() {
  this.synth.cancel();
}

toggleContrast() {
  document.body.classList.toggle('high-contrast');
}

adjustFontSize(delta: number) {
  const html = document.documentElement;
  const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
  html.style.fontSize = `${currentSize + delta}px`;
}


changeFont(event: Event) {
  const select = event.target as HTMLSelectElement;
  document.body.style.fontFamily = select.value;
}


  usuariosConectados = signal(this.getRandomUsuarios());

  constructor() {
    setInterval(() => {
      this.usuariosConectados.set(this.getRandomUsuarios());
    }, 2000);
  }

  getRandomUsuarios(): number {
    return Math.floor(Math.random() * 51) + 30; // 30 a 80
  }
}