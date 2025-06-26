import { Component, Output, EventEmitter } from '@angular/core';
import { FirebaseAuthService } from '../../../services/auth/firebase-auth.service';

@Component({
  selector: 'app-google-auth',
  template: `
    <div class="google-auth-container">
      <button class="google-btn" (click)="onGoogleLogin()" [disabled]="isLoading">
        <span *ngIf="!isLoading"><img src="assets/iconos/Google.png" alt="Google logo"> Ingresar con Google</span>
        <span *ngIf="isLoading" class="loading-spinner"></span>
      </button>
    </div>
  `,
  styleUrls: ['./google-auth.component.css']
})
export class GoogleAuthComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() info = new EventEmitter<string>();
  @Output() loading = new EventEmitter<boolean>();

  isLoading = false;

  constructor(private authService: FirebaseAuthService) {}

  onGoogleLogin() {
    this.isLoading = true;
    this.loading.emit(true);
    this.authService.loginWithGoogle().subscribe({
      next: (result) => {
        this.isLoading = false;
        this.loading.emit(false);
        if (result.success) {
          this.info.emit('¡Autenticación exitosa con Google!');
          this.loginSuccess.emit();
        } else {
          this.error.emit(result.error || 'Error al autenticar con Google');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loading.emit(false);
        this.error.emit('Error al autenticar con Google');
        console.error('Google login error:', err);
      }
    });
  }
}

