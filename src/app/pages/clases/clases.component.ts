import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './clases.component.html',
  styleUrls: ['./clases.component.css']
})
export class ClasesComponent {
  displayedColumns: string[] = ['hora', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  dataSource = [
    {
      hora: '07:00 - 08:00',
      lunes: 'CrossFit - Hugo VH.',
      martes: 'Spinning - Laura V.',
      miercoles: 'CrossFit - Hugo VH.',
      jueves: 'Spinning - Laura V.',
      viernes: 'CrossFit - Hugo VH.',
      sabado: 'Yoga - Angie G.',
      domingo: ''
    },
    {
      hora: '09:00 - 10:00',
      lunes: 'Zumba - Sofía R.',
      martes: 'Yoga - Angie G.',
      miercoles: 'Zumba - Sofía R.',
      jueves: 'Yoga - Angie G.',
      viernes: 'Zumba - Sofía R.',
      sabado: 'CrossFit - Hugo VH.',
      domingo: ''
    }
  ];

  constructor(private snackBar: MatSnackBar) {}

  abrirSnackBar(): void {
    this.snackBar.open('Contáctanos para más información sobre nuestras clases', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}