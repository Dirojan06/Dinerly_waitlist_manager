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

  cancelledGuest: any = null;
  restoreRequestSent = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('dinerly-theme');
    this.isDarkMode = savedTheme === 'dark';

    document.body.classList.toggle('dark-mode', this.isDarkMode);

    this.loadGuest();
  }

  // loadGuest(): void {
  //   const guestData = localStorage.getItem('waitlistGuest');

  //   if (guestData) {
  //     const parsedGuest = JSON.parse(guestData);

  //     if (parsedGuest?.status === 'CANCELLED') {
  //       this.showCancelledPopup = true;

  //       this.guest = null;
  //       this.isLoggedGuest = false;
  //       this.activeTab = 'WAITLIST';

  //       localStorage.removeItem('waitlistGuest');
  //       localStorage.removeItem('waitlistRestaurantId');
  //       return;
  //     }

  //     this.guest = parsedGuest;
  //     this.isLoggedGuest = true;
  //   } else {
  //     this.guest = null;
  //     this.isLoggedGuest = false;
  //   }
  // }

  loadGuest(): void {
    const guestData = localStorage.getItem('waitlistGuest');

    if (!guestData) {
      this.guest = null;
      this.cancelledGuest = null;
      this.isLoggedGuest = false;
      return;
    }

    try {
      const parsedGuest = JSON.parse(guestData);
      if (parsedGuest?.status === 'CANCELLED') {
        this.showAccessPopup = true;
      }

      if (
        parsedGuest?.status === 'CANCELLED' ||
        parsedGuest?.status === 'RESTORE_REQUESTED'
      ) {
        this.guest = null;
        this.cancelledGuest = parsedGuest;
        this.isLoggedGuest = false;
        this.activeTab = 'WAITLIST';

        this.restoreRequestSent =
          parsedGuest.status === 'RESTORE_REQUESTED';

        return;
      }

      this.guest = parsedGuest;
      this.cancelledGuest = null;
      this.restoreRequestSent = false;
      this.isLoggedGuest = true;
    } catch {
      localStorage.removeItem('waitlistGuest');
      localStorage.removeItem('waitlistRestaurantId');

      this.guest = null;
      this.cancelledGuest = null;
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

  // onGuestJoined(guest: any): void {
  //   if (guest?.status === 'CANCELLED') {
  //     this.showCancelledPopup = true;
  //     this.logoutGuest();
  //     return;
  //   }

  //   this.guest = guest;
  //   this.isLoggedGuest = true;
  //   this.activeTab = 'WAITLIST';
  // }


  onGuestJoined(guest: any): void {

    if (guest?.status === 'CANCELLED') {
      this.showAccessPopup = true;
    }

    if (
      guest?.status === 'CANCELLED' ||
      guest?.status === 'RESTORE_REQUESTED'
    ) {
      this.cancelledGuest = guest;
      this.restoreRequestSent =
        guest.status === 'RESTORE_REQUESTED';

      this.guest = null;
      this.isLoggedGuest = false;
      return;
    }

    this.guest = guest;
    this.cancelledGuest = null;
    this.restoreRequestSent = false;
    this.isLoggedGuest = true;
    this.activeTab = 'WAITLIST';
  }

  // logoutGuest(): void {
  //   localStorage.removeItem('waitlistGuest');
  //   localStorage.removeItem('waitlistRestaurantId');

  //   this.guest = null;
  //   this.isLoggedGuest = false;
  //   this.activeTab = 'WAITLIST';
  // }

  logoutGuest(): void {
    localStorage.removeItem('waitlistGuest');
    localStorage.removeItem('waitlistRestaurantId');

    this.guest = null;
    this.cancelledGuest = null;
    this.restoreRequestSent = false;
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

  onLeaveSuccess(cancelledGuest: any): void {
    this.guest = null;
    this.cancelledGuest = cancelledGuest;
    this.isLoggedGuest = false;
    this.restoreRequestSent = false;
    this.activeTab = 'WAITLIST';
  }

  // onLeaveSuccess(): void {
  //   this.logoutGuest();
  // }


  onRestoreRequested(restoredGuest: any): void {
    this.cancelledGuest = restoredGuest;
    this.restoreRequestSent = true;

    localStorage.setItem(
      'waitlistGuest',
      JSON.stringify(restoredGuest)
    );
  }
}