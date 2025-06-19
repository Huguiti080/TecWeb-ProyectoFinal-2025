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
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
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
    }

    // ========================================
    // GOOGLE AUTHENTICATION (actualizado)
    // ========================================
    loginWithGoogle(): Observable<{ success: boolean; user?: User; error?: string }> {
        const provider = new GoogleAuthProvider();
        return from(signInWithPopup(this.auth, provider)).pipe(
            map((result: UserCredential) => {
                if (result.user) {
                    this.updateUserData(result.user);
                    return { success: true, user: result.user };
                }
                return { success: false, error: 'No user data received' };
            }),
            catchError((error: any) => {
                console.error('Google login error:', error);
                return of({ success: false, error: this.getFirebaseErrorMessage(error.code) });
            })
        );
    }

    // ========================================
    // EMAIL AUTHENTICATION (NUEVO)
    // ========================================
    loginWithEmail(email: string, password: string): Observable<{ success: boolean; user?: User; error?: string; message?: string }> {
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            map((result: UserCredential) => {
                if (result.user) {
                    this.updateUserData(result.user);
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
                return of({ 
                    success: false, 
                    error: this.getFirebaseErrorMessage(error.code) 
                });
            })
        );
    }

    registerWithEmail(email: string, password: string, displayName?: string): Observable<{ success: boolean; user?: User; error?: string; message?: string }> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(async (result: UserCredential) => {
                if (result.user) {
                    try {
                        // Update profile if displayName provided
                        if (displayName) {
                            await updateProfile(result.user, { displayName });
                        }
                        
                        // Send email verification
                        await sendEmailVerification(result.user);
                        
                        await this.updateUserData(result.user);
                        
                        return { 
                            success: true, 
                            user: result.user,
                            message: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.' 
                        };
                    } catch (error) {
                        console.error('Profile update error:', error);
                        return { 
                            success: false, 
                            error: 'Cuenta creada pero hubo un error al configurar el perfil' 
                        };
                    }
                }
                return { success: false, error: 'Error al crear la cuenta' };
            }),
            catchError((error: any) => {
                console.error('Email registration error:', error);
                return of({ 
                    success: false, 
                    error: this.getFirebaseErrorMessage(error.code) 
                });
            })
        );
    }

    sendPasswordResetEmail(email: string): Observable<{ success: boolean; error?: string; message?: string }> {
        return from(sendPasswordResetEmail(this.auth, email)).pipe(
            map(() => ({ 
                success: true, 
                message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' 
            })),
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
                this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
                    size: 'invisible',
                    callback: () => {
                        console.log('reCAPTCHA resolved');
                        observer.next(this.recaptchaVerifier!);
                        observer.complete();
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                        observer.error(new Error('reCAPTCHA expired'));
                    }
                });
                
                this.recaptchaVerifier.render().then(() => {
                    observer.next(this.recaptchaVerifier!);
                    observer.complete();
                }).catch(error => {
                    observer.error(error);
                });
            } catch (error) {
                console.error('reCAPTCHA setup error:', error);
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
            map((result: UserCredential) => {
                if (result.user) {
                    this.updateUserData(result.user);
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
            'auth/invalid-phone-number': 'Número de teléfono inválido',
            'auth/invalid-verification-code': 'Código de verificación inválido',
            'auth/code-expired': 'El código de verificación ha expirado',
            'auth/missing-phone-number': 'Número de teléfono requerido',
            'auth/quota-exceeded': 'Cuota de SMS excedida',
            'auth/captcha-check-failed': 'reCAPTCHA falló, intenta de nuevo'
        };

        return errorMessages[errorCode] || 'Ha ocurrido un error inesperado';
    }

    // Clean up reCAPTCHA
    clearRecaptcha(): void {
        if (this.recaptchaVerifier) {
            this.recaptchaVerifier.clear();
            this.recaptchaVerifier = null;
        }
    }
}