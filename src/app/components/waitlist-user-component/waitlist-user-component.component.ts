import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-waitlist-user-component',
  templateUrl: './waitlist-user-component.component.html',
  styleUrls: ['./waitlist-user-component.component.css']
})
export class WaitlistUserComponentComponent {

  restaurantId = 1;
  isWaitingRoute = false;
  isDarkMode = false;
  constructor(private router: Router) {
    this.isWaitingRoute = this.router.url.includes('/user/waiting');
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isWaitingRoute = event.urlAfterRedirects.includes('/user/waiting');
      });
    const savedTheme = localStorage.getItem('dinerly-theme');

    this.isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );
  }

  toggleTheme(): void {

    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(
      'dinerly-theme',
      this.isDarkMode ? 'dark' : 'light'
    );

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );
  }

  onJoinedWaitlist(guest: any): void {

    localStorage.setItem('waitlistGuest', JSON.stringify(guest));
    localStorage.setItem('waitlistRestaurantId', this.restaurantId.toString());
    this.router.navigate(['/user/waiting']);

  }
}
