import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {

  constructor() { }

  /**
   * Verifica el captcha del usuario
   * @returns Observable que emite true si el captcha es válido, false en caso contrario
   */
  verifyCaptcha(): Observable<{ success: boolean; error?: string }> {
    // Simulación de verificación de captcha
    // En un entorno real, aquí se verificaría con el servicio de reCAPTCHA
    return of({ success: true }).pipe(
      delay(500) // Simular tiempo de verificación
    );
  }

  /**
   * Verifica si el captcha está configurado correctamente
   * @returns Observable que emite true si está configurado
   */
  isCaptchaConfigured(): Observable<boolean> {
    return of(true);
  }
}
