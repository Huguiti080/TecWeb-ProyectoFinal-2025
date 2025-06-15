import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {
    private auth: Auth = inject(Auth);

    // Versión que devuelve Observable (mejor para manejo en componentes)

    loginWithGoogle(): Observable<void> {
        const provider = new GoogleAuthProvider();
        return from(signInWithPopup(this.auth, provider)).pipe(
            map(() => { }) // Convertimos a Observable<void>
        );
    }

}