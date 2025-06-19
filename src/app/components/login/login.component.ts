import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../services/auth/firebase-auth.service';
import { AuthService } from '../../services/auth/auth.service';
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
  loading = false;
  showError = false;
  errorMessage = '';
  successMessage = '';
  
  // Estados específicos para SMS
  showVerificationCode = false;
  verificationId: string = '';
  smsLoading = false;

  constructor(
    private fb: FormBuilder,
    private firebaseAuth: FirebaseAuthService,
    private router: Router
  ) {
    // Formulario de email (mantienes tu lógica actual)
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Nuevo formulario para SMS
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      verificationCode: ['', [Validators.required, Validators.minLength(6)]]
    });
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
  }

  private resetSMSState() {
    this.showVerificationCode = false;
    this.verificationId = '';
    this.smsLoading = false;
    this.phoneForm.get('verificationCode')?.setValue('');
  }

  // =====================================
  // AUTENTICACIÓN POR EMAIL (tu lógica actual mejorada)
  // =====================================
  onEmailLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.clearMessages();

    const { email, password } = this.loginForm.value;

    // Usar el nuevo servicio Firebase con Observable
    this.firebaseAuth.loginWithEmail(email, password).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.successMessage = result.message || '¡Bienvenido de vuelta!';
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        } else {
          this.errorMessage = result.error || 'Error en el inicio de sesión';
          this.showError = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error inesperado en el servidor';
        this.showError = true;
        console.error('Email login error:', err);
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
        if (result.success) {
          this.successMessage = result.message || '¡Autenticación exitosa!';
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
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
        if (result.success) {
          this.successMessage = '¡Autenticación exitosa con Google!';
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
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
  // FUNCIONES AUXILIARES (mantienen tu lógica actual)
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

  // Manejo de errores (mantienes tu lógica actual)
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