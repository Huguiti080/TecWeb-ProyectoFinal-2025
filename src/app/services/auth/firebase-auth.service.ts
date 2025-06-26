import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
  updateProfile,
  sendEmailVerification,
  signOut,
  User,
  UserCredential,
  ConfirmationResult
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp, collection, addDoc, getDoc, deleteDoc, updateDoc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface LoginRecord {
  userId: string;
  emailOrPhone: string;
  method: 'email' | 'google' | 'phone';
  timestamp: any; // serverTimestamp
}

export interface BlockedUser {
  email: string;
  failedAttempts: number;
  lastFailedAttempt: any; // serverTimestamp
  blockedAt: any; // serverTimestamp
  isBlocked: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    private router: Router = inject(Router);
    
    private userSubject = new BehaviorSubject<AuthUser | null>(null);
    public user$ = this.userSubject.asObservable();
    
    private recaptchaVerifier: RecaptchaVerifier | null = null;

    constructor() {
        // Monitor auth state
        this.auth.onAuthStateChanged(user => {
            if (user) {
                const authUser: AuthUser = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    phoneNumber: user.phoneNumber || '',
                    photoURL: user.photoURL || '',
                    emailVerified: user.emailVerified
                };
                this.userSubject.next(authUser);
                localStorage.setItem('user', JSON.stringify(authUser));
            } else {
                this.userSubject.next(null);
                localStorage.removeItem('user');
            }
        });

        // Probar conectividad con Firestore al inicializar
        this.testFirestoreConnection().then(success => {
            if (success) {
                console.log('🎉 Servicio Firebase Auth inicializado correctamente');
            } else {
                console.warn('⚠️ Problemas de conectividad con Firestore detectados');
            }
        });
    }

    // ========================================
    // GOOGLE AUTHENTICATION (actualizado)
    // ========================================
    loginWithGoogle(): Observable<{ success: boolean; user?: User; error?: string }> {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
      
        return from(signInWithPopup(this.auth, provider)).pipe(
          switchMap((result: UserCredential) => {
            if (result.user) {
              const user = result.user;
              const emailOrPhone = user.email || user.phoneNumber || 'unknown';
      
              return from(
                Promise.all([
                  this.updateUserData(user),
                  this.guardarLoginExitoso(user.uid, emailOrPhone, 'google')
                ])
              ).pipe(
                map(() => ({ success: true, user })),
                catchError(err => {
                  console.error('❌ Error post-login Google:', err);
                  return of({ success: false, error: 'Error al registrar login de Google' });
                })
              );
            }
            return of({ success: false, error: 'No user found' });
          }),
          catchError((error: any) => {
            console.error('Google login error:', error);
            return of({ success: false, error: this.getFirebaseErrorMessage(error.code) });
          })
        );
      }
      

    // ========================================
    // EMAIL AUTHENTICATION (MEJORADO CON BLOQUEO)
    // ========================================
    loginWithEmail(email: string, password: string): Observable<{ success: boolean; user?: User; error?: string; message?: string }> {
        const emailLower = email.toLowerCase();
        
        return from(this.checkUserBlockStatus(emailLower)).pipe(
            switchMap(blockStatus => {
                if (blockStatus.isBlocked) {
                    return of({ 
                        success: false, 
                        error: 'Tu cuenta está bloqueada. Restablece tu contraseña para desbloquearla.' 
                    });
                }
                
                // Si no está bloqueado, intentar login
                return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
                    switchMap(async (result: UserCredential) => {
                        if (result.user) {
                            await this.updateUserData(result.user);
                            await this.guardarLoginExitoso(result.user.uid, email, 'email');
                            
                            // Reset failed attempts on successful login
                            await this.resetFailedAttempts(emailLower);
                            
                            return { 
                                success: true, 
                                user: result.user,
                                message: '¡Bienvenido de vuelta!' 
                            };
                        }
                        return { success: false, error: 'Error en el inicio de sesión' };
                    }),
                    catchError((error: any) => {
                        console.error('Email login error:', error);
                        
                        // Increment failed attempts
                        return from(this.incrementFailedAttempts(emailLower)).pipe(
                            switchMap(() => {
                                const errorMessage = this.getFirebaseErrorMessage(error.code);
                                return of({ 
                                    success: false, 
                                    error: errorMessage 
                                });
                            })
                        );
                    })
                );
            }),
            catchError((error: any) => {
                console.error('Error checking block status:', error);
                return of({ 
                    success: false, 
                    error: 'Error al verificar el estado de la cuenta' 
                });
            })
        );
    }

    registerWithEmail(email: string, password: string, displayName?: string): Observable<{ success: boolean; user?: User; error?: string; message?: string }> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(async (result: UserCredential) => {
                if (result.user) {
                    try {
                        // Actualiza el perfil con displayName
                        if (displayName) {
                            await updateProfile(result.user, { displayName });
                        }
                        // Guarda en Firestore con rol 'user'
                        const userRef = doc(this.firestore, `users/${result.user.uid}`);
                        await setDoc(userRef, {
                            uid: result.user.uid,
                            email: result.user.email,
                            displayName: displayName || '',
                            role: 'user',
                            createdAt: serverTimestamp()
                        });
                        return { success: true, user: result.user, message: 'Cuenta creada exitosamente.' };
                    } catch (error) {
                        return { success: false, error: 'Error al guardar usuario en Firestore' };
                    }
                }
                return { success: false, error: 'Error al crear la cuenta' };
            }),
            catchError((error: any) => of({ success: false, error: this.getFirebaseErrorMessage(error.code) }))
        );
    }

    sendPasswordResetEmail(email: string): Observable<{ success: boolean; error?: string; message?: string }> {
        const emailLower = email.toLowerCase();
        
        return from(sendPasswordResetEmail(this.auth, email)).pipe(
            switchMap(async () => {
                // Unblock user when password reset is requested
                await this.unblockUser(emailLower);
                
                return { 
                    success: true, 
                    message: 'Email de recuperación enviado. Revisa tu bandeja de entrada. Tu cuenta ha sido desbloqueada.' 
                };
            }),
            catchError((error: any) => {
                console.error('Password reset error:', error);
                return of({ 
                    success: false, 
                    error: this.getFirebaseErrorMessage(error.code) 
                });
            })
        );
    }

    // ========================================
    // SMS/PHONE AUTHENTICATION (NUEVO)
    // ========================================
    setupRecaptcha(containerId: string): Observable<RecaptchaVerifier> {
        return new Observable(observer => {
          try {
            // Solo inicializa si no existe ya
            if (!this.recaptchaVerifier) {
              this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
                size: 'invisible',
                callback: (response: any) => {
                  console.log('reCAPTCHA resuelto');
                  observer.next(this.recaptchaVerifier!);
                  observer.complete();
                },
                'expired-callback': () => {
                  console.warn('reCAPTCHA expirado');
                  observer.error(new Error('reCAPTCHA expired'));
                }
              });
            }
      
            this.recaptchaVerifier.render()
              .then(widgetId => {
                console.log('reCAPTCHA renderizado con widgetId:', widgetId);
                observer.next(this.recaptchaVerifier!);
                observer.complete();
              })
              .catch(error => {
                console.error('Error al renderizar reCAPTCHA:', error);
                observer.error(error);
              });
      
          } catch (error) {
            console.error('Error al configurar reCAPTCHA:', error);
            observer.error(error);
          }
        });
      }
      

    //enviar SMS
    sendVerificationCode(phoneNumber: string): Observable<{ success: boolean; verificationId?: string; confirmationResult?: ConfirmationResult; error?: string; message?: string }> {
        if (!this.recaptchaVerifier) {
            return of({ success: false, error: 'reCAPTCHA not initialized' });
        }

        return from(signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)).pipe(
            map((confirmationResult: ConfirmationResult) => ({
                success: true,
                verificationId: confirmationResult.verificationId,
                confirmationResult,
                message: 'Código de verificación enviado a tu teléfono'
            })),
            catchError((error: any) => {
                console.error('SMS send error:', error);
                return of({ 
                    success: false, 
                    error: this.getFirebaseErrorMessage(error.code) 
                });
            })
        );
    }

    //verificar codigo
    verifyPhoneCode(verificationId: string, verificationCode: string): Observable<{ success: boolean; user?: User; error?: string; message?: string }> {
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        
        return from(signInWithCredential(this.auth, credential)).pipe(
            switchMap(async (result: UserCredential) => {
                if (result.user) {
                    await this.updateUserData(result.user);
                    
                    // Guardar registro de login exitoso
                    const phoneNumber = result.user.phoneNumber || 'unknown';
                    await this.guardarLoginExitoso(result.user.uid, phoneNumber, 'phone');
                    
                    return { 
                        success: true, 
                        user: result.user,
                        message: '¡Autenticación exitosa!' 
                    };
                }
                return { success: false, error: 'Error en la verificación' };
            }),
            catchError((error: any) => {
                console.error('Phone verification error:', error);
                return of({ 
                    success: false, 
                    error: this.getFirebaseErrorMessage(error.code) 
                });
            })
        );
    }

    // ========================================
    // UTILITY METHODS
    // ========================================
    logout(): Observable<void> {
        return from(signOut(this.auth)).pipe(
            map(() => {
                localStorage.removeItem('user');
                this.router.navigate(['/login']);
            }),
            catchError((error) => {
                console.error('Logout error:', error);
                throw error;
            })
        );
    }

    getCurrentUser(): AuthUser | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn(): boolean {
        return this.getCurrentUser() !== null;
    }

    /**
     * Actualiza o crea la información del usuario en Firestore.
     * @param user Objeto User de Firebase Auth con toda la información del usuario, collecion users
     * @returns Promise que se resuelve cuando se actualiza la información
     */
    private async updateUserData(user: User): Promise<void> {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        
        const data: any = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(userRef, data, { merge: true });
    }

    private getFirebaseErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/user-not-found': 'No existe una cuenta con este email',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Ya existe una cuenta con este email',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
            'auth/popup-closed-by-user': 'Inicio de sesión cancelado. Cierra la ventana de Google.',
            'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite popups para este sitio.',
            'auth/cancelled-popup-request': 'Solicitud de inicio de sesión cancelada',
            'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de inicio de sesión',
            'auth/invalid-phone-number': 'Número de teléfono inválido',
            'auth/invalid-verification-code': 'Código de verificación inválido',
            'auth/code-expired': 'El código de verificación ha expirado',
            'auth/missing-phone-number': 'Número de teléfono requerido',
            'auth/quota-exceeded': 'Cuota de SMS excedida',
            'auth/captcha-check-failed': 'reCAPTCHA falló, intenta de nuevo'
        };

        return errorMessages[errorCode] || 'Ha ocurrido un error inesperado';
    }

    // ========================================
    // USER BLOCKING METHODS (FIRESTORE)
    // ========================================
    
    /**
     * Verifica si un usuario está bloqueado en Firestore
     * @param email Email del usuario a verificar
     * @returns Promise que se resuelve con el estado de bloqueo
     */
    private async checkUserBlockStatus(email: string): Promise<{ isBlocked: boolean; failedAttempts: number }> {
        try {
            const blockedUserRef = doc(this.firestore, 'blockedUsers', email);
            const blockedUserDoc = await getDoc(blockedUserRef);
            
            if (blockedUserDoc.exists()) {
                const data = blockedUserDoc.data() as BlockedUser;
                return { 
                    isBlocked: data.isBlocked, 
                    failedAttempts: data.failedAttempts 
                };
            }
            
            return { isBlocked: false, failedAttempts: 0 };
        } catch (error) {
            console.error('Error checking user block status:', error);
            return { isBlocked: false, failedAttempts: 0 };
        }
    }

    /**
     * Incrementa el contador de intentos fallidos
     * @param email Email del usuario
     * @returns Promise que se resuelve cuando se actualiza el contador
     */
    private async incrementFailedAttempts(email: string): Promise<void> {
        try {
            const blockedUserRef = doc(this.firestore, 'blockedUsers', email);
            const blockedUserDoc = await getDoc(blockedUserRef);
            
            let currentAttempts = 0;
            let isBlocked = false;
            
            if (blockedUserDoc.exists()) {
                const data = blockedUserDoc.data() as BlockedUser;
                currentAttempts = data.failedAttempts;
                isBlocked = data.isBlocked;
            }
            
            currentAttempts++;
            
            // Bloquear después de 3 intentos fallidos
            if (currentAttempts >= 3) {
                isBlocked = true;
            }
            
            const blockedUserData: BlockedUser = {
                email,
                failedAttempts: currentAttempts,
                lastFailedAttempt: serverTimestamp(),
                blockedAt: isBlocked ? serverTimestamp() : null,
                isBlocked
            };
            
            await setDoc(blockedUserRef, blockedUserData);
            
            console.log(`📊 Intentos fallidos para ${email}: ${currentAttempts}/3`);
            if (isBlocked) {
                console.log(`🚫 Usuario ${email} bloqueado`);
            }
        } catch (error) {
            console.error('Error incrementing failed attempts:', error);
        }
    }

    /**
     * Resetea el contador de intentos fallidos (login exitoso)
     * @param email Email del usuario
     * @returns Promise que se resuelve cuando se resetea el contador
     */
    private async resetFailedAttempts(email: string): Promise<void> {
        try {
            const blockedUserRef = doc(this.firestore, 'blockedUsers', email);
            const blockedUserDoc = await getDoc(blockedUserRef);
            
            if (blockedUserDoc.exists()) {
                const blockedUserData: BlockedUser = {
                    email,
                    failedAttempts: 0,
                    lastFailedAttempt: null,
                    blockedAt: null,
                    isBlocked: false
                };
                
                await setDoc(blockedUserRef, blockedUserData);
                console.log(`Intentos fallidos reseteados para ${email}`);
            }
        } catch (error) {
            console.error('Error resetting failed attempts:', error);
        }
    }

    /**
     * Desbloquea un usuario (usado cuando se solicita reset de contraseña)
     * @param email Email del usuario a desbloquear
     * @returns Promise que se resuelve cuando se desbloquea el usuario
     */
    private async unblockUser(email: string): Promise<void> {
        try {
            const blockedUserRef = doc(this.firestore, 'blockedUsers', email);
            const blockedUserDoc = await getDoc(blockedUserRef);
            
            if (blockedUserDoc.exists()) {
                const blockedUserData: BlockedUser = {
                    email,
                    failedAttempts: 0,
                    lastFailedAttempt: null,
                    blockedAt: null,
                    isBlocked: false
                };
                
                await setDoc(blockedUserRef, blockedUserData);
                console.log(`🔓 Usuario ${email} desbloqueado`);
            }
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    }

    /**
     * Obtiene información de bloqueo de un usuario (para admin)
     * @param email Email del usuario
     * @returns Observable con la información de bloqueo
     */
    getUserBlockInfo(email: string): Observable<{ blocked: boolean; failedAttempts: number; error?: string }> {
        const emailLower = email.toLowerCase();
        
        return from(this.checkUserBlockStatus(emailLower)).pipe(
            map(status => ({ 
                blocked: status.isBlocked, 
                failedAttempts: status.failedAttempts 
            })),
            catchError(error => {
                console.error('Error getting user block info:', error);
                return of({ 
                    blocked: false, 
                    failedAttempts: 0, 
                    error: 'Error al obtener información de bloqueo' 
                });
            })
        );
    }

    /**
     * Bloquea manualmente un usuario (para admin)
     * @param email Email del usuario a bloquear
     * @returns Observable que emite true si se bloqueó exitosamente
     */
    blockUser(email: string): Observable<{ success: boolean; error?: string }> {
        const emailLower = email.toLowerCase();
        
        return from(this.manualBlockUser(emailLower)).pipe(
            map(() => ({ success: true })),
            catchError(error => {
                console.error('Error blocking user:', error);
                return of({ success: false, error: 'Error al bloquear usuario' });
            })
        );
    }

    /**
     * Desbloquea manualmente un usuario (para admin)
     * @param email Email del usuario a desbloquear
     * @returns Observable que emite true si se desbloqueó exitosamente
     */
    unblockUserManual(email: string): Observable<{ success: boolean; error?: string }> {
        const emailLower = email.toLowerCase();
        
        return from(this.unblockUser(emailLower)).pipe(
            map(() => ({ success: true })),
            catchError(error => {
                console.error('Error unblocking user:', error);
                return of({ success: false, error: 'Error al desbloquear usuario' });
            })
        );
    }

    /**
     * Bloquea manualmente un usuario (método privado)
     * @param email Email del usuario a bloquear
     * @returns Promise que se resuelve cuando se bloquea el usuario
     */
    private async manualBlockUser(email: string): Promise<void> {
        try {
            const blockedUserRef = doc(this.firestore, 'blockedUsers', email);
            
            const blockedUserData: BlockedUser = {
                email,
                failedAttempts: 3,
                lastFailedAttempt: serverTimestamp(),
                blockedAt: serverTimestamp(),
                isBlocked: true
            };
            
            await setDoc(blockedUserRef, blockedUserData);
            console.log(`🚫 Usuario ${email} bloqueado manualmente`);
        } catch (error) {
            console.error('Error manually blocking user:', error);
            throw error;
        }
    }

    // ========================================
    // LOGIN RECORDING METHODS
    // ========================================
    
    /**
     * Guarda un registro de login exitoso en Firestore.
     * 
     * FUNCIONALIDAD:
     * - Registra cada login exitoso para auditoría y análisis
     * - Permite rastrear patrones de uso y seguridad
     * - Facilita la detección de actividades sospechosas
     * - Proporciona datos para reportes de administración
     * 
     * DATOS REGISTRADOS:
     * - userId: ID único del usuario (Firebase Auth UID)
     * - emailOrPhone: Email o número de teléfono usado para login
     * - method: Método de autenticación ('email', 'google', 'phone')
     * - timestamp: Fecha y hora exacta del login (serverTimestamp)
     * 
     * COLECCIÓN: logins (colección automática)
     * 
     * CASOS DE USO:
     * - Auditoría de seguridad
     * - Análisis de patrones de uso
     * - Detección de logins no autorizados
     * - Reportes de actividad de usuarios
     * - Cumplimiento de regulaciones (GDPR, etc.)
     * 
     * @param userId UID del usuario de Firebase Auth
     * @param emailOrPhone Email o número de teléfono del usuario
     * @param method Método de autenticación usado ('email', 'google', 'phone')
     * @returns Promise que se resuelve cuando se guarda el registro
     */
    private async guardarLoginExitoso(userId: string, emailOrPhone: string, method: 'email' | 'google' | 'phone'): Promise<void> {
        try {
            console.log('🔄 Iniciando guardado de login...', { userId, emailOrPhone, method });
            
            const loginRecord: LoginRecord = {
                userId,
                emailOrPhone: emailOrPhone.toLowerCase(),
                method,
                timestamp: serverTimestamp()
            };

            console.log('📝 Datos del registro:', loginRecord);

            const loginsRef = collection(this.firestore, 'logins');
            console.log('📁 Referencia a colección logins creada');
            
            const docRef = await addDoc(loginsRef, loginRecord);
            console.log('✅ Login registrado exitosamente:', { 
                method, 
                emailOrPhone, 
                documentId: docRef.id 
            });
        } catch (error) {
            console.error('❌ Error al guardar registro de login:', error);
            console.error('🔍 Detalles del error:', {
                message: error instanceof Error ? error.message : 'Error desconocido',
                code: (error as any)?.code || 'Sin código',
                stack: error instanceof Error ? error.stack : 'Sin stack trace'
            });
            // No lanzamos el error para no interrumpir el flujo de login
        }
    }

    // ========================================
    // FIRESTORE TEST METHODS
    // ========================================
    
    /**
     * Función de prueba para verificar conectividad con Firestore
     * @returns Promise que se resuelve con true si la conexión es exitosa
     */
    public async testFirestoreConnection(): Promise<boolean> {
        try {
            console.log('🧪 Probando conectividad con Firestore...');
            
            const testRef = collection(this.firestore, 'test');
            const testDoc = await addDoc(testRef, {
                test: true,
                timestamp: serverTimestamp()
            });
            
            console.log('✅ Conexión con Firestore exitosa, documento creado:', testDoc.id);
            return true;
        } catch (error) {
            console.error('❌ Error de conectividad con Firestore:', error);
            console.error('🔍 Detalles del error:', {
                message: error instanceof Error ? error.message : 'Error desconocido',
                code: (error as any)?.code || 'Sin código'
            });
            return false;
        }
    }

    // Clean up reCAPTCHA
    clearRecaptcha(): void {
        if (this.recaptchaVerifier) {
            this.recaptchaVerifier.clear();
            this.recaptchaVerifier = null;
        }
    }

    // Devuelve el rol del usuario
    getUserRole(uid: string): Observable<string> {
        const userRef = doc(this.firestore, `users/${uid}`);
        return docData(userRef).pipe(
            map((data: any) => data?.role || 'user')
        );
    }

    // Devuelve true si el usuario actual es admin
    isAdmin(): Observable<boolean> {
        return this.user$.pipe(
            switchMap(user => {
                if (!user) return of(false);
                const userRef = doc(this.firestore, `users/${user.uid}`);
                return docData(userRef).pipe(
                    map((data: any) => data?.role === 'admin')
                );
            })
        );
    }
}