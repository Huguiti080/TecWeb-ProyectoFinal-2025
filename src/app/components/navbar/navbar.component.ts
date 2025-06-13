import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  @Input() set user(user: { fullName: string } | null) {
    this.isLoggedIn = !!user;
    if (user) {
      this.userName = user.fullName;
    }
  }

  
  @Output() loginRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();
  @Output() menuItemClicked = new EventEmitter<string>();

  isLoggedIn = false;
  userName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  
  login(): void {
    this.loginRequested.emit(); 
    this.router.navigate(['/login']); 
  }

  
  logout(): void {
    this.logoutRequested.emit(); 
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }

  
  navigateTo(route: string): void {
    this.menuItemClicked.emit(route); 
    this.router.navigate([route]); 
  }

    
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}