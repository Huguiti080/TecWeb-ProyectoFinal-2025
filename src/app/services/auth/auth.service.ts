import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  UserCredential,
  updateProfile,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';

export interface AppUser {
  fullName: string;  // Cambiado a obligatorio
  email: string;     // Cambiado a obligatorio
  uid: string;       // Cambiado a obligatorio
  username?: string; // Mantenido como opcional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user: AppUser = {
          fullName: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email || '',
          uid: firebaseUser.uid,
          username: firebaseUser.displayName?.split(' ')[0] || undefined
        };
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // Métodos mejorados
  async login(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = this.createAppUser(userCredential.user);
      this.router.navigate(['/dashboard']);
      return user;
    } catch (error) {
      console.error("Error en login:", error);
      throw this.handleAuthError(error);
    }
  }

  async register(email: string, password: string, fullName: string): Promise<AppUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      const user = this.createAppUser(userCredential.user);
      this.router.navigate(['/dashboard']);
      return user;
    } catch (error) {
      console.error("Error en registro:", error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      throw this.handleAuthError(error);
    }
  }

  // Métodos de compatibilidad
  legacyLogin(username: string, password: string): Observable<{ success: boolean; message: string }> {
    return from(this.login(`${username}@temp.com`, password)).pipe(
      map(() => ({ success: true, message: 'Inicio de sesión exitoso' })),
      catchError(error => of({ 
        success: false, 
        message: this.handleAuthError(error).message 
      }))
    );
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  // Helpers privados
  private createAppUser(firebaseUser: any): AppUser {
    return {
      fullName: firebaseUser.displayName || 'Usuario',
      email: firebaseUser.email || '',
      uid: firebaseUser.uid,
      username: firebaseUser.displayName?.split(' ')[0] || undefined
    };
  }

  private handleAuthError(error: any): Error {
    // Puedes personalizar los mensajes de error aquí
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está registrado'
    };
    
    const code = error.code || '';
    return new Error(errorMap[code] || 'Error de autenticación');
  }
}