import {
  Component,
  OnInit
} from '@angular/core';

import {
  GuestAccount,
  GuestPortalTab
} from 'src/app/models/guest-portal.model';

@Component({
  selector: 'app-waitlist-user-component',
  templateUrl: './waitlist-user-component.component.html',
  styleUrls: ['./waitlist-user-component.component.css']
})
export class WaitlistUserComponentComponent implements OnInit {

  isDarkMode = false;

  activeTab: GuestPortalTab = 'HOME';

  waitlistGuest: any = null;

  customerAccount: GuestAccount | null = null;

  cancelledGuest: any = null;

  restoreRequestSent = false;

  showWaitlistAccessPopup = false;

  showAccountLoginPopup = false;

  showCancelledPopup = false;

  private requestedAccountTab: GuestPortalTab | null = null;

  ngOnInit(): void {
    this.loadTheme();
    this.loadWaitlistGuest();
    this.loadCustomerAccount();
  }

  get hasWaitlistAccess(): boolean {
    return !!this.waitlistGuest;
  }

  get hasAccountAccess(): boolean {
    return !!this.customerAccount;
  }

  private loadTheme(): void {
    const savedTheme =
      localStorage.getItem('dinerly-theme');

    this.isDarkMode =
      savedTheme === 'dark';

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );
  }

  loadWaitlistGuest(): void {
    const guestData =
      localStorage.getItem('waitlistGuest');

    if (!guestData) {
      this.waitlistGuest = null;
      this.cancelledGuest = null;
      return;
    }

    try {
      const parsedGuest =
        JSON.parse(guestData);

      if (
        parsedGuest?.status === 'CANCELLED' ||
        parsedGuest?.status === 'RESTORE_REQUESTED'
      ) {
        this.waitlistGuest = null;

        this.cancelledGuest =
          parsedGuest;

        this.restoreRequestSent =
          parsedGuest.status ===
          'RESTORE_REQUESTED';

        return;
      }

      this.waitlistGuest =
        parsedGuest;

      this.cancelledGuest = null;

      this.restoreRequestSent = false;
    } catch {
      this.clearWaitlistStorage();

      this.waitlistGuest = null;
      this.cancelledGuest = null;
    }
  }

  loadCustomerAccount(): void {
    const accountData =
      localStorage.getItem(
        'dinerlyCustomerAccount'
      );

    if (!accountData) {
      this.customerAccount = null;
      return;
    }

    try {
      this.customerAccount =
        JSON.parse(accountData);
    } catch {
      localStorage.removeItem(
        'dinerlyCustomerAccount'
      );

      localStorage.removeItem(
        'dinerlyCustomerToken'
      );

      this.customerAccount = null;
    }
  }

  changeTab(tab: GuestPortalTab): void {
    if (tab === 'HOME') {
      this.activeTab = 'HOME';
      return;
    }

    if (tab === 'WAITLIST') {
      if (!this.hasWaitlistAccess) {
        this.showWaitlistAccessPopup = true;
        return;
      }

      this.activeTab = 'WAITLIST';
      return;
    }

    if (this.isEmailProtectedTab(tab)) {
      if (!this.hasAccountAccess) {
        this.requestedAccountTab = tab;
        this.showAccountLoginPopup = true;
        return;
      }

      this.activeTab = tab;
    }
  }

  private isEmailProtectedTab(
    tab: GuestPortalTab
  ): boolean {
    return (
      tab === 'MENU' ||
      tab === 'OFFERS' ||
      tab === 'REWARDS'
    );
  }

  onGuestJoined(guest: any): void {
    if (!guest) {
      return;
    }

    if (
      guest.status === 'CANCELLED' ||
      guest.status === 'RESTORE_REQUESTED'
    ) {
      this.waitlistGuest = null;

      this.cancelledGuest = guest;

      this.restoreRequestSent =
        guest.status ===
        'RESTORE_REQUESTED';

      this.showCancelledPopup =
        guest.status === 'CANCELLED';

      return;
    }

    this.waitlistGuest = guest;

    this.cancelledGuest = null;

    this.restoreRequestSent = false;

    localStorage.setItem(
      'waitlistGuest',
      JSON.stringify(guest)
    );

    this.activeTab = 'WAITLIST';
  }

  onAccountLoginSuccess(
    account: GuestAccount
  ): void {
    this.customerAccount = account;

    localStorage.setItem(
      'dinerlyCustomerAccount',
      JSON.stringify(account)
    );

    if (account.token) {
      localStorage.setItem(
        'dinerlyCustomerToken',
        account.token
      );
    }

    this.showAccountLoginPopup = false;

    if (
      this.requestedAccountTab &&
      this.isEmailProtectedTab(
        this.requestedAccountTab
      )
    ) {
      this.activeTab =
        this.requestedAccountTab;
    } else {
      this.activeTab = 'HOME';
    }

    this.requestedAccountTab = null;
  }

  logoutWaitlistGuest(): void {
    this.clearWaitlistStorage();

    this.waitlistGuest = null;
    this.cancelledGuest = null;
    this.restoreRequestSent = false;

    if (this.activeTab === 'WAITLIST') {
      this.activeTab = 'HOME';
    }
  }

  logoutCustomerAccount(): void {
    localStorage.removeItem(
      'dinerlyCustomerAccount'
    );

    localStorage.removeItem(
      'dinerlyCustomerToken'
    );

    this.customerAccount = null;

    if (
      this.activeTab === 'MENU' ||
      this.activeTab === 'OFFERS' ||
      this.activeTab === 'REWARDS'
    ) {
      this.activeTab = 'HOME';
    }
  }

  private clearWaitlistStorage(): void {
    localStorage.removeItem(
      'waitlistGuest'
    );

    localStorage.removeItem(
      'waitlistRestaurantId'
    );
  }

  openAccountLoginPopup(
    requestedTab?: GuestPortalTab
  ): void {
    if (requestedTab) {
      this.requestedAccountTab =
        requestedTab;
    }

    this.showAccountLoginPopup = true;
  }

  closeAccountLoginPopup(): void {
    this.showAccountLoginPopup = false;
    this.requestedAccountTab = null;
  }

  closeWaitlistAccessPopup(): void {
    this.showWaitlistAccessPopup = false;
  }

  closeCancelledPopup(): void {
    this.showCancelledPopup = false;
  }

  onLeaveSuccess(
    cancelledGuest: any
  ): void {
    this.waitlistGuest = null;

    this.cancelledGuest =
      cancelledGuest;

    this.restoreRequestSent = false;

    this.activeTab = 'HOME';
  }

  onRestoreRequested(
    restoredGuest: any
  ): void {
    this.cancelledGuest =
      restoredGuest;

    this.restoreRequestSent = true;

    localStorage.setItem(
      'waitlistGuest',
      JSON.stringify(restoredGuest)
    );
  }

  toggleTheme(): void {
    this.isDarkMode =
      !this.isDarkMode;

    localStorage.setItem(
      'dinerly-theme',
      this.isDarkMode
        ? 'dark'
        : 'light'
    );

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );
  }
}

export { GuestAccount, GuestPortalTab };
