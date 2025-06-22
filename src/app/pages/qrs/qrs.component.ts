import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRService } from '../../services/callAPI/qr.service';
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
  qrRedSocialURL: string = '';
  redSocialActiva: string = '';

  constructor(private qrService: QRService) {}

  ngOnInit(): void {
    // Solo cargamos la red social activa
    this.qrService.getRedSocialActiva().subscribe({
      next: res => {
        console.log('Red social activa:', res.redSocialActiva);
this.redSocialActiva = res.redSocialActiva.charAt(0).toUpperCase() + res.redSocialActiva.slice(1);
        this.qrRedSocialURL = res.url;
      },
      error: err => {
        console.error('Error al obtener red social:', err);
      }
    });
  }
}
