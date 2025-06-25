import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { signInWithPhoneNumber, RecaptchaVerifier, getAuth } from 'firebase/auth';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../services/auth/firebase-auth.service';
import { AuthService } from '../../services/auth/auth.service';
import { CaptchaService } from '../../services/auth/captcha.service';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgClass],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Formularios
  loginForm: FormGroup;
  phoneForm: FormGroup;
  
  // Control de tabs
  activeTab: 'email' | 'phone' | 'google' = 'email';
  
  // Estados generales
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  showError = false;
  errorMessage = '';
  successMessage = '';
  isRedirecting = false;
  
  // Estados específicos para SMS
  showVerificationCode = false;  // Controla si mostrar el formulario de verificación o el de ingreso de teléfono
  verificationId: string = '';   // ID único de la verificación SMS (proporcionado por Firebase)
  smsLoading = false;            // Indica si hay un proceso SMS en curso (enviar/verificar código)
  confirmationResult: any;       // Resultado de la confirmación SMS (Firebase object)
  recaptchaVerifier!: RecaptchaVerifier;  // Instancia del reCAPTCHA para prevenir spam
  auth = getAuth();              // Instancia de Firebase Auth

  // Información de bloqueo
  currentFailedAttempts = 0;
  maxAttempts = 3;

  constructor(
    private fb: FormBuilder,
    private firebaseAuth: FirebaseAuthService,
    private captchaService: CaptchaService,
    private router: Router
  ) {
    // Formulario de email con validación de confirmación de contraseña
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
      passwordConfirm: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Nuevo formulario para SMS
    // Valida número de teléfono con código de país y código de verificación de 6 dígitos
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      verificationCode: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    
    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  // Validador personalizado para la contraseña
  private passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.value;
    
    if (!password) {
      return null; // Dejamos que el validador required maneje esto
    }

    // Verificar longitud mínima
    if (password.length < 6) {
      return { 'passwordTooShort': { requiredLength: 6, actualLength: password.length } };
    }

    // Verificar caracteres válidos (solo letras, dígitos y guión bajo)
    const validCharsRegex = /^[a-zA-Z0-9_]+$/;
    if (!validCharsRegex.test(password)) {
      return { 'passwordInvalidChars': true };
    }

    // Verificar que contenga al menos una mayúscula
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      return { 'passwordNoUpperCase': true };
    }

    // Verificar que contenga al menos un dígito
    const hasDigit = /[0-9]/.test(password);
    if (!hasDigit) {
      return { 'passwordNoDigit': true };
    }

    return null; // Contraseña válida
  }

  // =====================================
  // MÉTODOS PARA CAMBIAR TABS
  // =====================================
  setActiveTab(tab: 'email' | 'phone' | 'google') {
    this.activeTab = tab;
    this.clearMessages();
    this.resetSMSState();
  }

  private clearMessages() {
    this.showError = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.isRedirecting = false;
  }

  private resetSMSState() {
    this.showVerificationCode = false;
    this.verificationId = '';
    this.smsLoading = false;
    this.phoneForm.get('verificationCode')?.setValue('');
  }

  /**
   * Se ejecuta cuando el usuario cambia el email en el formulario
   */
  onEmailChange() {
    this.clearMessages();
    // Verificar estado de bloqueo cuando cambia el email
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.checkUserBlockStatus(email);
    }
  }

  /**
   * Verifica el estado de bloqueo del usuario
   */
  private checkUserBlockStatus(email: string) {
    this.firebaseAuth.getUserBlockInfo(email).subscribe({
      next: (result) => {
        this.currentFailedAttempts = result.failedAttempts;
        if (result.blocked) {
          this.errorMessage = 'Tu cuenta está bloqueada. Restablece tu contraseña para desbloquearla.';
          this.showError = true;
        }
      },
      error: (err) => {
        console.error('Error checking user block status:', err);
      }
    });
  }

  // =====================================
  // AUTENTICACIÓN POR EMAIL (SIMPLIFICADA)
  // =====================================
  onEmailLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.clearMessages();

    const { email, password } = this.loginForm.value;

    // 1️⃣ Verificar captcha
    this.captchaService.verifyCaptcha().subscribe({
      next: (captchaResult) => {
        if (!captchaResult.success) {
          this.loading = false;
          this.errorMessage = captchaResult.error || 'Error en la verificación de seguridad. Intenta de nuevo.';
          this.showError = true;
          return;
        }

        // 2️⃣ Intentar el login (el servicio maneja el bloqueo automáticamente)
        this.firebaseAuth.loginWithEmail(email, password).subscribe({
          next: (result) => {
            this.loading = false;
            if (result.success && result.user) {
              // Login exitoso
              this.successMessage = result.message || '¡Bienvenido de vuelta!';
              this.isRedirecting = true;
              this.firebaseAuth.getUserRole(result.user.uid).subscribe(role => {
                if (role === 'admin') {
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/inicio']);
                }
              });
            } else {
              // Login fallido - el servicio ya incrementó los intentos
              this.errorMessage = result.error || 'Error en el inicio de sesión';
              this.showError = true;
              // Actualizar contador de intentos fallidos
              this.currentFailedAttempts++;
              // Mostrar mensaje de intentos restantes si no está bloqueado
              if (this.currentFailedAttempts < this.maxAttempts) {
                const remainingAttempts = this.maxAttempts - this.currentFailedAttempts;
                this.errorMessage += ` (${remainingAttempts} intentos restantes)`;
              }
            }
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = 'Error inesperado en el servidor';
            this.showError = true;
            console.error('Email login error:', err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error en la verificación de seguridad. Intenta de nuevo.';
        this.showError = true;
        console.error('Captcha verification error:', err);
      }
    });
  }

  // =====================================
  // AUTENTICACIÓN POR SMS (NUEVO)
  // =====================================
  

  sendSMSCode() {
    if (this.phoneForm.get('phoneNumber')?.invalid) {
      this.errorMessage = 'Por favor ingresa un número de teléfono válido';
      this.showError = true;
      return;
    }

    this.smsLoading = true;
    this.clearMessages();

    const phoneNumber = this.phoneForm.get('phoneNumber')?.value;

    // Primero configurar reCAPTCHA
    this.firebaseAuth.setupRecaptcha('recaptcha-container').subscribe({
      next: () => {
        // Luego enviar el código SMS
        this.firebaseAuth.sendVerificationCode(phoneNumber).subscribe({
          next: (result) => {
            this.smsLoading = false;
            if (result.success) {
              this.verificationId = result.verificationId || '';
              this.showVerificationCode = true;
              this.successMessage = result.message || 'Código enviado a tu teléfono';
            } else {
              this.errorMessage = result.error || 'Error enviando código SMS';
              this.showError = true;
            }
          },
          error: (err) => {
            this.smsLoading = false;
            this.errorMessage = 'Error enviando código SMS';
            this.showError = true;
            console.error('SMS send error:', err);
          }
        });
      },
      error: (err) => {
        this.smsLoading = false;
        this.errorMessage = 'Error configurando verificación. Intenta de nuevo.';
        this.showError = true;
        console.error('reCAPTCHA setup error:', err);
      }
    });
  }

  /**
   * Verifica el código SMS ingresado por el usuario y autentica si es correcto.

   */
  verifyPhoneCode() {
    if (this.phoneForm.get('verificationCode')?.invalid) {
      this.errorMessage = 'Por favor ingresa el código de verificación';
      this.showError = true;
      return;
    }

    this.smsLoading = true;
    this.clearMessages();

    const verificationCode = this.phoneForm.get('verificationCode')?.value;

    this.firebaseAuth.verifyPhoneCode(this.verificationId, verificationCode).subscribe({
      next: (result) => {
        this.smsLoading = false;
        if (result.success && result.user) {
          this.successMessage = result.message || '¡Autenticación exitosa!';
          this.isRedirecting = true;
          this.firebaseAuth.getUserRole(result.user.uid).subscribe(role => {
            if (role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/inicio']);
            }
          });
        } else {
          this.errorMessage = result.error || 'Código de verificación inválido';
          this.showError = true;
        }
      },
      error: (err) => {
        this.smsLoading = false;
        this.errorMessage = 'Error verificando código';
        this.showError = true;
        console.error('Phone verification error:', err);
      }
    });
  }

  // =====================================
  // AUTENTICACIÓN CON GOOGLE (tu lógica actual mejorada)
  // =====================================
  loginWithGoogle() {
    this.loading = true;
    this.clearMessages();

    this.firebaseAuth.loginWithGoogle().subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success && result.user) {
          this.successMessage = '¡Autenticación exitosa con Google!';
          this.isRedirecting = true;
          this.firebaseAuth.getUserRole(result.user.uid).subscribe(role => {
            if (role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/inicio']);
            }
          });
        } else {
          this.errorMessage = result.error || 'Error al autenticar con Google';
          this.showError = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al autenticar con Google';
        this.showError = true;
        console.error('Google login error:', err);
      }
    });
  }

  // =====================================
  // FUNCIONES AUXILIARES
  // =====================================
  
  onForgotPassword() {
    if (this.loginForm.get('email')?.invalid) {
      this.errorMessage = 'Por favor ingresa tu email para restablecer la contraseña';
      this.showError = true;
      return;
    }

    this.loading = true;
    this.clearMessages();

    const email = this.loginForm.get('email')?.value;
    
    this.firebaseAuth.sendPasswordResetEmail(email).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.successMessage = result.message || `Enlace de recuperación enviado a ${email}`;
          // Reset contador de intentos fallidos
          this.currentFailedAttempts = 0;
        } else {
          this.errorMessage = result.error || 'Error enviando email de recuperación';
          this.showError = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error enviando email de recuperación';
        this.showError = true;
        console.error('Password reset error:', err);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Métodos para el indicador de fortaleza de contraseña
  getPasswordStrengthClass(): string {
    const password = this.loginForm.get('password')?.value;
    if (!password) return '';

    const strength = this.calculatePasswordStrength(password);
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    if (strength <= 4) return 'strong';
    return 'very-strong';
  }

  getPasswordStrengthText(): string {
    const password = this.loginForm.get('password')?.value;
    if (!password) return '';

    const strength = this.calculatePasswordStrength(password);
    
    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    if (strength <= 4) return 'Fuerte';
    return 'Muy fuerte';
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    
    // Longitud mínima (6 caracteres)
    if (password.length >= 6) strength++;
    
    // Contiene mayúscula
    if (/[A-Z]/.test(password)) strength++;
    
    // Contiene dígito
    if (/[0-9]/.test(password)) strength++;
    
    // Solo caracteres válidos
    if (/^[a-zA-Z0-9_]+$/.test(password)) strength++;
    
    // Longitud adicional (más de 8 caracteres)
    if (password.length >= 8) strength++;
    
    return strength;
  }

  // Manejo de errores ()
  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Cuenta temporalmente bloqueada';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/invalid-phone-number':
        return 'Número de teléfono inválido';
      case 'auth/invalid-verification-code':
        return 'Código de verificación inválido';
      case 'auth/code-expired':
        return 'El código de verificación ha expirado';
      default:
        return 'Error al iniciar sesión';
    }
  }

  // Limpieza al destruir componente
  ngOnDestroy() {
    this.firebaseAuth.clearRecaptcha();
  }

  
}