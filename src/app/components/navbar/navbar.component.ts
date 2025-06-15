import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // Input/Output mejor tipados
  @Input() user: { fullName: string } | null = null;
  @Output() menuItemClicked = new EventEmitter<string>();
  
  // Eliminados loginRequested/logoutRequested (manejados internamente)
  isLoggedIn = false;
  userName = '';

  // Items de navegación centralizados
  navItems = [
    { path: '/inicio', label: 'Inicio' },
    { path: '/planes', label: 'Planes' },
    { path: '/clases', label: 'Clases' },
    { path: '/productos', label: 'Productos' },
    { path: '/servicios', label: 'Regístrate' },
    { path: '/contacto', label: 'Contacto' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  // Manejo simplificado de login
  async login() {
    await this.router.navigate(['/login']);
  }

  // Logout con confirmación
  async logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      await this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }
}