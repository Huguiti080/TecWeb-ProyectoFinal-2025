import { Routes } from '@angular/router';
import { authGuard } from '../app/services/auth.guard'; // Asegúrate de que la ruta del guard sea correcta

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { 
    path: 'inicio', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'Planes', 
    loadComponent: () => import('./pages/planes/planes.component').then(m => m.PlanesComponent) 
  },
  { 
    path: 'clases', 
    loadComponent: () => import('./pages/clases/clases.component').then(m => m.ClasesComponent) 
  },
  { 
    path: 'servicios', 
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent) 
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent) 
  },
  { 
    path: 'contacto', 
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'registro', 
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent) 
  },
  { 
    path: 'contactoregistro', 
    loadComponent: () => import('./pages/contactoregistro/contactoregistro.component').then(m => m.ContactoregistroComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard] // Protege esta ruta
  },
  { path: '**', redirectTo: 'inicio' } // Ruta comodín para 404
];