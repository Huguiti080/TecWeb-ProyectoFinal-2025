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
  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firebaseAuth: FirebaseAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Login con email/contraseña
  onEmailLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.showError = false;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).then(() => {
      this.router.navigate(['/dashboard']);
      this.loading = false;
    }).catch((err: { code: string; }) => {
      this.errorMessage = this.getErrorMessage(err.code);
      this.showError = true;
      this.loading = false;
    });
  }

  // Login con Google
  loginWithGoogle() {
    this.firebaseAuth.loginWithGoogle().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = 'Error al autenticar con Google';
        this.showError = true;
      }
    });
  }

  // Olvidó contraseña
  onForgotPassword() {
    if (this.loginForm.get('email')?.invalid) {
      this.errorMessage = 'Por favor ingresa tu email para restablecer la contraseña';
      this.showError = true;
      return;
    }

    const email = this.loginForm.get('email')?.value;
    this.authService.resetPassword(email).then(() => {
      this.errorMessage = `Se ha enviado un enlace de recuperación a ${email}`;
      this.showError = true;
    }).catch((err: { code: string; }) => {
      this.errorMessage = this.getErrorMessage(err.code);
      this.showError = true;
    });
  }

  // Mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Manejo de errores
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
      default:
        return 'Error al iniciar sesión';
    }
  }
}