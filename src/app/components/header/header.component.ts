import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component'; 
import { CommonModule } from '@angular/common';
import { LoginComponent } from "../login/login.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavbarComponent, CommonModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Recibe el usuario desde AppComponent
  @Input() user: { fullName: string } | null = null;

  

  // Transmite eventos desde el Navbar al AppComponent
  @Output() menuItemClicked = new EventEmitter<string>();
  @Output() loginRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  // Maneja eventos del navbar
  handleNavbarEvent(event: { type: string, data?: any }) {
    switch(event.type) {
      case 'menuItemClicked':
        this.menuItemClicked.emit(event.data);
        break;
      case 'loginRequested':
        this.loginRequested.emit();
        break;
      case 'logoutRequested':
        this.logoutRequested.emit();
        break;
    }
  }
}