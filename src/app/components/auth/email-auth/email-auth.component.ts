// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { FirebaseAuthService } from '../../../services/auth/firebase-auth.service';

// @Component({
//   selector: 'app-email-auth',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './email-auth.component.html',
//   styleUrl: './email-auth.component.css'
// })
// export class EmailAuthComponent {
//   private fb = inject(FormBuilder);
//   private authService = inject(FirebaseAuthService);
//   private router = inject(Router);

//   // Signals
//   isLoginMode = signal(true);
//   forgotPasswordMode = signal(false);
//   showPassword = signal(false);
//   isLoading = signal(false);
//   errorMessage = signal('');
//   successMessage = signal('');

//   // Forms
//   authForm: FormGroup;
//   forgotPasswordForm: FormGroup;

//   constructor() {
//     this.authForm = this.fb.group({
//       displayName: [''],
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]]
//     });

//     this.forgotPasswordForm = this.fb.group({
//       resetEmail: ['', [Validators.required, Validators.email]]
//     });

//     // Update validators when mode changes
//     this.updateValidators();
//   }

//   toggleMode(): void {
//     this.isLoginMode.set(!this.isLoginMode());
//     this.clearMessages();
//     this.authForm.reset();
//     this.updateValidators();
//   }

//   private updateValidators(): void {
//     const displayNameControl = this.authForm.get('displayName');
    
//     if (this.isLoginMode()) {
//       displayNameControl?.clearValidators();
//     } else {
//       displayNameControl?.setValidators([Validators.required]);
//     }
    
//     displayNameControl?.updateValueAndValidity();
//   }

//   togglePasswordVisibility(): void {
//     this.showPassword.set(!this.showPassword());
//   }

//   showForgotPassword(): void {
//     this.forgotPasswordMode.set(true);
//     this.clearMessages();
//   }

//   hideForgotPassword(): void {
//     this.forgotPasswordMode.set(false);
//     this.forgotPasswordForm.reset();
//     this.clearMessages();
//   }

//   onSubmit(): void {
//     if (this.authForm.invalid) return;

//     this.isLoading.set(true);
//     this.clearMessages();

//     const { email, password, displayName } = this.authForm.value;

//     const authObservable = this.isLoginMode()
//       ? this.authService.loginWithEmail(email, password)
//       : this.authService.registerWithEmail(email, password, displayName);

//     authObservable.subscribe({
//       next: (result) => {
//         this.isLoading.set(false);
        
//         if (result.success) {
//           this.successMessage.set(result.message || 'Operación exitosa');
          
//           if (this.isLoginMode()) {
//             // Redirect after successful login
//             setTimeout(() => {
//               this.router.navigate(['/dashboard']);
//             }, 1500);
//           } else {
//             // Show success message for registration
//             setTimeout(() => {
//               this.isLoginMode.set(true);
//               this.authForm.reset();
//               this.clearMessages();
//             }, 3000);
//           }
//         } else {
//           this.errorMessage.set(result.error || 'Error desconocido');
//         }
//       },
//       error: (error) => {
//         this.isLoading.set(false);
//         this.errorMessage.set('Error de conexión. Intenta de nuevo.');
//         console.error('Auth error:', error);
//       }
//     });
//   }

//   onForgotPassword(): void {
//     if (this.forgotPasswordForm.invalid) return;

//     this.isLoading.set(true);
//     this.clearMessages();

//     const { resetEmail } = this.forgotPasswordForm.value;

//     this.authService.sendPasswordResetEmail(resetEmail).subscribe({
//       next: (result) => {
//         this.isLoading.set(false);
        
//         if (result.success) {
//           this.successMessage.set(result.message || 'Email enviado');
//           setTimeout(() => {
//             this.hideForgotPassword();
//           }, 3000);
//         } else {
//           this.errorMessage.set(result.error || 'Error al enviar email');
//         }
//       },
//       error: (error) => {
//         this.isLoading.set(false);
//         this.errorMessage.set('Error de conexión. Intenta de nuevo.');
//         console.error('Password reset error:', error);
//       }
//     });
//   }

//   private clearMessages(): void {
//     this.errorMessage.set('');
//     this.successMessage.set('');
//   }
// }