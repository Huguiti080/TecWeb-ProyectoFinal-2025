import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRService } from '../../services/callAPI/qr.service';
import { QRCodeComponent } from 'angularx-qrcode'; 

@Component({
  selector: 'app-qrs',
  standalone: true,
  imports: [CommonModule, QRCodeComponent], 
  templateUrl: './qrs.component.html',
  styleUrl: './qrs.component.css'
})
export class QrsComponent implements OnInit {
  qrDataList: string[] = [];

  constructor(private qrService: QRService) {}

  ngOnInit(): void {
    const ids = ['1', '2', '3', '4', '5', '6'];
    ids.forEach(id => {
      this.qrService.getDatosQr(id).subscribe({
        next: data => {
          const qrText = JSON.stringify(data);
          this.qrDataList.push(qrText);
        },
        error: err => {
          console.error(`Error al obtener QR para ID ${id}:`, err);
        }
      });
    });
  }
}
