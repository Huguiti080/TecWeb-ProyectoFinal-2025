import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { ClasesComponent } from './pages/clases/clases.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { ContactoregistroComponent } from './pages/contactoregistro/contactoregistro.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'Planes', component: PlanesComponent },
  { path: 'clases', component: ClasesComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'contactoregistro', component: ContactoregistroComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'inicio' }
];