// // import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// export interface User {
//   username: string;
//   password: string;
//   fullName: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private adminUsers: User[] = [
//     { username: 'Hugo', password: '123', fullName: 'Hugo Vazquez' },
//     { username: 'Andre', password: '123', fullName: 'Andre Velazquez' },
//     { username: 'Andres', password: '123', fullName: 'Andres De Anda' }
//   ];

//   private currentUserSubject = new BehaviorSubject<User | null>(null);
//   public currentUser = this.currentUserSubject.asObservable();
//   resetPassword: any;

//   constructor() {
//     // Verificar si hay un usuario guardado en localStorage al iniciar
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       this.currentUserSubject.next(JSON.parse(storedUser));
//     }
//   }

//   login(username: string, password: string): {
//     subscribe: any; success: boolean; message: string 
// } {
//     const user = this.adminUsers.find(
//       user => user.username === username && user.password === password
//     );

//     if (user) {
//       // Guarda el usuario en localStorage (sin la contraseña para mayor seguridad)
//       const userToStore = {
//         username: user.username,
//         fullName: user.fullName
//       };
//       localStorage.setItem('currentUser', JSON.stringify(userToStore));
//       this.currentUserSubject.next(user);
//       return { success: true, message: 'Inicio de sesión exitoso' };
//     }

//     return { success: false, message: 'Credenciales incorrectas. Por favor, inténtelo de nuevo.' };
//   }

//   logout(): void {
//     localStorage.removeItem('currentUser');
//     this.currentUserSubject.next(null);
//   }

//   isLoggedIn(): boolean {
//     return this.currentUserSubject.value !== null;
//   }

//   getCurrentUser(): User | null {
//     return this.currentUserSubject.value;
//   }
//  }