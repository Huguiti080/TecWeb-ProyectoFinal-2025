import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qrs',
  imports: [CommonModule],
  templateUrl: './qrs.component.html',
  styleUrl: './qrs.component.css'
})
export class QrsComponent {
placeholders = [1, 2, 3, 4, 5, 6];

}
