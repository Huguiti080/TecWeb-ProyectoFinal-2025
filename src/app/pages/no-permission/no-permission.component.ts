import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-no-permission',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align:center; margin-top: 80px; color: orange;">
      <h1>Acceso denegado</h1>
      <p>No tienes permisos para acceder a esta sección.</p>
      <a routerLink="/inicio" style="color: orange; text-decoration: underline;">Volver al inicio</a>
    </div>
  `
})
export class NoPermissionComponent {} 