import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AppUser, AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gimnasio-app';
  currentUser: AppUser| null = null;

  constructor(private authService: AuthService) {
    // Suscripción al estado de autenticación
    this.authService.currentUser$.subscribe((user: AppUser | null) => {
      this.currentUser = user;
    });
  }

  // Maneja eventos de navegación desde el navbar
  handleMenuItemClick(route: string) {
    console.log('Navegación solicitada a:', route);
    // Aquí puedes añadir lógica adicional si es necesario
  }

  // Maneja solicitud de login
  handleLoginRequest() {
    console.log('Login solicitado desde header/navbar');
  }

  // Maneja solicitud de logout
  handleLogoutRequest() {
    console.log('Logout solicitado desde header/navbar');
    this.authService.logout();
  }
}