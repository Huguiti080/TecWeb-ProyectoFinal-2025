import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRService, Registro } from '../../services/callAPI/qr.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-qrs',
  standalone: true,
  imports: [CommonModule, QRCodeComponent, HttpClientModule],
  templateUrl: './qrs.component.html',
  styleUrl: './qrs.component.css'
})
export class QrsComponent implements OnInit {
  qrDataList: string[] = [];

  constructor(private qrService: QRService) {}

  ngOnInit(): void {
    this.qrService.getTodosLosRegistros().subscribe({
      next: (registros: Registro[]) => {
        console.log('Registros recibidos:', registros);
        this.qrDataList = registros.map(reg =>
          JSON.stringify({
            nombre: reg.nombre,
            correo: reg.correo,
            telefono: reg.telefono,
            servicio: reg.servicio
          })
        );
      },
      error: err => {
        console.error('Error al obtener los registros:', err);
      }
    });
  }
}
