import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { authState } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    map(user => {
      if (user) {
        return true; // Usuario autenticado, permite acceso
      } else {
        router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } // Opcional: Guarda la URL solicitada
        });
        return false; // Usuario no autenticado, redirige a login
      }
    })
  );
};