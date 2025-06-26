import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { authState } from '@angular/fire/auth';
import { from, map, switchMap } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(Firestore);

  return authState(auth).pipe(
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return from([false]);
      }
      const ref = doc(firestore, `users/${user.uid}`);
      return from(getDoc(ref)).pipe(
        map(docSnap => {
          const data = docSnap.data();
          if (data?.['role'] === 'admin') {
            return true;
          } else {
            router.navigate(['/']);
            return false;
          }
        })
      );
    })
  );
};
