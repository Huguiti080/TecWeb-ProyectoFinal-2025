// import { Component, Output, EventEmitter } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { FirebaseAuthService } from '../../../services/auth/firebase-auth.service';

// @Component({
//   selector: 'app-reset-password',
//   template: `
//     <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
//       <label for="email">Email</label>
//       <input type="email" id="email" formControlName="email" placeholder="tu@email.com">
//       <button type="submit" [disabled]="resetForm.invalid || isLoading">Enviar recuperación</button>
//     </form>
//   `,
//   styleUrls: ['./reset-password.component.css']
// })
// export class ResetPasswordComponent {
//   @Output() info = new EventEmitter<string>();
//   @Output() error = new EventEmitter<string>();
//   @Output() loading = new EventEmitter<boolean>();

//   resetForm: FormGroup;
//   isLoading = false;

//   constructor(
//     private fb: FormBuilder,
//     private authService: FirebaseAuthService
//   ) {
//     this.resetForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]]
//     });
//   }

//   onSubmit() {
//     if (this.resetForm.invalid) return;
//     this.isLoading = true;
//     this.loading.emit(true);
//     const email = this.resetForm.get('email')?.value;
//     this.authService.sendPasswordResetEmail(email).subscribe({
//       next: (result) => {
//         this.isLoading = false;
//         this.loading.emit(false);
//         if (result.success) {
//           this.info.emit(result.message || 'Email enviado');
//         } else {
//           this.error.emit(result.error || 'Error enviando email de recuperación');
//         }
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.loading.emit(false);
//         this.error.emit('Error enviando email de recuperación');
//         console.error('Password reset error:', err);
//       }
//     });
//   }
// }
