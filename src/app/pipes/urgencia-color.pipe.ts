import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urgenciaColor',
  standalone: true
})
export class UrgenciaColorPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Baja': return '🟢 Baja';
      case 'Normal': return '🟡 Normal';
      case 'Urgente': return '🔴 Urgente';
      default: return value;
    }
  }
}
