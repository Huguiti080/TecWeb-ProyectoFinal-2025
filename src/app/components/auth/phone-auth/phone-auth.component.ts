import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../../../services/auth/firebase-auth.service';

@Component({
  selector: 'app-phone-auth',
  templateUrl: './phone-auth.component.html',
  styleUrls: ['./phone-auth.component.css']
})
export class PhoneAuthComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() info = new EventEmitter<string>();
  @Output() loading = new EventEmitter<boolean>();

  phoneForm: FormGroup;
  showVerificationCode = false;
  verificationId = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService
  ) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      verificationCode: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  sendSMSCode() {
    if (this.phoneForm.get('phoneNumber')?.invalid) {
      this.error.emit('Por favor ingresa un número de teléfono válido');
      return;
    }
    this.isLoading = true;
    this.loading.emit(true);
    const phoneNumber = this.phoneForm.get('phoneNumber')?.value;
    this.authService.setupRecaptcha('recaptcha-container').subscribe({
      next: () => {
        this.authService.sendVerificationCode(phoneNumber).subscribe({
          next: (result) => {
            this.isLoading = false;
            this.loading.emit(false);
            if (result.success) {
              this.verificationId = result.verificationId || '';
              this.showVerificationCode = true;
              this.info.emit(result.message || 'Código enviado a tu teléfono');
            } else {
              this.error.emit(result.error || 'Error enviando código SMS');
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.loading.emit(false);
            this.error.emit('Error enviando código SMS');
            console.error('SMS send error:', err);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.loading.emit(false);
        this.error.emit('Error configurando verificación. Intenta de nuevo.');
        console.error('reCAPTCHA setup error:', err);
      }
    });
  }

  verifyPhoneCode() {
    if (this.phoneForm.get('verificationCode')?.invalid) {
      this.error.emit('Por favor ingresa el código de verificación');
      return;
    }
    this.isLoading = true;
    this.loading.emit(true);
    const verificationCode = this.phoneForm.get('verificationCode')?.value;
    this.authService.verifyPhoneCode(this.verificationId, verificationCode).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.loading.emit(false);
        if (result.success) {
          this.info.emit(result.message || '¡Autenticación exitosa!');
          this.loginSuccess.emit();
        } else {
          this.error.emit(result.error || 'Código de verificación inválido');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loading.emit(false);
        this.error.emit('Error verificando código');
        console.error('Phone verification error:', err);
      }
    });
  }
}
