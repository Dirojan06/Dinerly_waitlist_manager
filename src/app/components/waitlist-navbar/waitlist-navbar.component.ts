import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from 'src/app/models/waitlist-auth.model';
import { WaitlistAuthService } from 'src/app/services/waitlist-auth.service';

@Component({
  selector: 'app-waitlist-navbar',
  templateUrl: './waitlist-navbar.component.html',
  styleUrls: ['./waitlist-navbar.component.css']
})
export class WaitlistNavbarComponent implements OnInit {

  user: AuthUser | null = null;
  @Input() isDarkMode = false;

  @Output() themeToggle = new EventEmitter<void>();
  showMobileMenu = false;
  constructor(private auth: WaitlistAuthService) {

  }


  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  toggleMobileMenu(): void {

    this.showMobileMenu = !this.showMobileMenu;
    localStorage.setItem(
      'dinerly-theme',
      this.isDarkMode ? 'dark' : 'light'
    );

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );
  }

  toggleTheme() {
    this.themeToggle.emit();
  }

  closeMobileMenu(): void {

    this.showMobileMenu = false;

  }

  signOut(): void {
    this.showMobileMenu = false;
    this.auth.signOut();
  }

}
