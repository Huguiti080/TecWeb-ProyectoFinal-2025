import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../../../services/auth/firebase-auth.service';

@Component({
  selector: 'app-email-auth',
  templateUrl: './email-auth.component.html',
  styleUrls: ['./email-auth.component.css']
})
export class EmailAuthComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() info = new EventEmitter<string>();
  @Output() loading = new EventEmitter<boolean>();

  isLoginMode = true;
  forgotPasswordMode = false;
  showPassword = false;

  authForm: FormGroup;
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService
  ) {
    this.authForm = this.fb.group({
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      resetEmail: ['', [Validators.required, Validators.email]]
    });

    this.updateValidators();
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearForms();
    this.updateValidators();
  }

  private updateValidators(): void {
    const displayNameControl = this.authForm.get('displayName');
    if (this.isLoginMode) {
      displayNameControl?.clearValidators();
    } else {
      displayNameControl?.setValidators([Validators.required]);
    }
    displayNameControl?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showForgotPassword(): void {
    this.forgotPasswordMode = true;
    this.clearForms();
  }

  hideForgotPassword(): void {
    this.forgotPasswordMode = false;
    this.forgotPasswordForm.reset();
    this.clearForms();
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;
    this.loading.emit(true);
    this.clearForms();

    const { email, password, displayName } = this.authForm.value;

    const authObservable = this.isLoginMode
      ? this.authService.loginWithEmail(email, password)
      : this.authService.registerWithEmail(email, password, displayName);

    authObservable.subscribe({
      next: (result) => {
        this.loading.emit(false);
        if (result.success) {
          this.info.emit(result.message || 'Operación exitosa');
          if (this.isLoginMode) {
            this.loginSuccess.emit();
          } else {
            setTimeout(() => {
              this.isLoginMode = true;
              this.authForm.reset();
              this.clearForms();
            }, 2000);
          }
        } else {
          this.error.emit(result.error || 'Error desconocido');
        }
      },
      error: (error) => {
        this.loading.emit(false);
        this.error.emit('Error de conexión. Intenta de nuevo.');
        console.error('Auth error:', error);
      }
    });
  }

  onForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) return;
    this.loading.emit(true);
    this.clearForms();

    const { resetEmail } = this.forgotPasswordForm.value;

    this.authService.sendPasswordResetEmail(resetEmail).subscribe({
      next: (result) => {
        this.loading.emit(false);
        if (result.success) {
          this.info.emit(result.message || 'Email enviado');
          setTimeout(() => {
            this.hideForgotPassword();
          }, 2000);
        } else {
          this.error.emit(result.error || 'Error al enviar email');
        }
      },
      error: (error) => {
        this.loading.emit(false);
        this.error.emit('Error de conexión. Intenta de nuevo.');
        console.error('Password reset error:', error);
      }
    });
  }

  private clearForms(): void {
    this.error.emit('');
    this.info.emit('');
  }
}