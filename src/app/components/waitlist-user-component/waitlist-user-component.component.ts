import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-component',
  templateUrl: './waitlist-user-component.component.html',
  styleUrls: ['./waitlist-user-component.component.css']
})
export class WaitlistUserComponentComponent implements OnInit {

  isDarkMode = false;
  activeTab: 'WAITLIST' | 'MENU' | 'DISCOUNT' = 'WAITLIST';

  guest: any = null;
  isLoggedGuest = false;

  showAccessPopup = false;
  showCancelledPopup = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('dinerly-theme');
    this.isDarkMode = savedTheme === 'dark';

    document.body.classList.toggle('dark-mode', this.isDarkMode);

    this.loadGuest();
  }

  loadGuest(): void {
    const guestData = localStorage.getItem('waitlistGuest');

    if (guestData) {
      const parsedGuest = JSON.parse(guestData);

      if (parsedGuest?.status === 'CANCELLED') {
        this.showCancelledPopup = true;

        this.guest = null;
        this.isLoggedGuest = false;
        this.activeTab = 'WAITLIST';

        localStorage.removeItem('waitlistGuest');
        localStorage.removeItem('waitlistRestaurantId');
        return;
      }

      this.guest = parsedGuest;
      this.isLoggedGuest = true;
    } else {
      this.guest = null;
      this.isLoggedGuest = false;
    }
  }

  changeTab(tab: 'WAITLIST' | 'MENU' | 'DISCOUNT'): void {
    if (!this.isLoggedGuest) {
      this.showAccessPopup = true;
      return;
    }

    this.activeTab = tab;
  }

  onGuestJoined(guest: any): void {
    if (guest?.status === 'CANCELLED') {
      this.showCancelledPopup = true;
      this.logoutGuest();
      return;
    }

    this.guest = guest;
    this.isLoggedGuest = true;
    this.activeTab = 'WAITLIST';
  }

  logoutGuest(): void {
    localStorage.removeItem('waitlistGuest');
    localStorage.removeItem('waitlistRestaurantId');

    this.guest = null;
    this.isLoggedGuest = false;
    this.activeTab = 'WAITLIST';
  }

  closeCancelledPopup(): void {
    this.showCancelledPopup = false;
  }

  closeAccessPopup(): void {
    this.showAccessPopup = false;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem(
      'dinerly-theme',
      this.isDarkMode ? 'dark' : 'light'
    );

    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  onLeaveSuccess(): void {
    this.logoutGuest();
  }
}