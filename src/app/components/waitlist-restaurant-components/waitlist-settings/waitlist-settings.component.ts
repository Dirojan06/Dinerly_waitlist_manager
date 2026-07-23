import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

type SettingsTab =
  | 'profile'
  | 'notification'
  | 'waitlist'
  | 'tables'
  | 'holiday'
  | 'advanced';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  onFloor: boolean;
}

interface HolidayHour {
  id: number;
  name: string;
  date: string;
  closed: boolean;
  openTime?: string;
  closeTime?: string;
}

@Component({
  selector: 'app-waitlist-settings',
  templateUrl: './waitlist-settings.component.html',
  styleUrls: ['./waitlist-settings.component.css']
})
export class WaitlistSettingsComponent
  implements OnInit, OnDestroy {

  activeTab: SettingsTab = 'profile';

  currentTimeOnly = '';

  restaurant = {
    name: 'Brothers Café',
    address: '123 Market St, Winnipeg',
    hours: '11:00 AM – 10:00 PM',
    phone: '(204) 555-0142'
  };

  currentPlan = {
    name: 'Basic',
    notificationUsed: 142,
    notificationLimit: 150,
    marketingUsed: 31,
    marketingLimit: 50,
    overageCharges: '$0.000',
    renewalDate: 'Aug 10, 2026'
  };

  guestNotifications = {
    textWhenReady: true,
    callWhenReady: true,
    joinConfirmation: true,
    reservationConfirmation: true,
    autoRemoveNoShows: false
  };

  staffNotifications = {
    waitingPastQuotedTime: true,
    tableOpenTooLong: false
  };

  textTemplate = 'Friendly';
  callScript = 'Friendly';
  selectedVoice = '';

  textTemplates = [
    'Friendly',
    'Professional',
    'Short and simple'
  ];

  callScripts = [
    'Friendly',
    'Professional',
    'Short and simple'
  ];

  voices = [
    'Female voice',
    'Male voice',
    'Natural voice'
  ];

  waitlistRules = {
    maxPartySize: 10,
    responseWindow: 10,
    walkInsOnly: false,
    pauseAfterClosing: true,
    addFromGoogle: true,
    acceptOnline: true
  };

  floorOverview = {
    sections: 1,
    totalTables: 12,
    totalSeats: 48
  };

  staffName = '';
  staffRole = 'Server';

  staffRoles = [
    'Server',
    'Host',
    'Bartender',
    'Busser',
    'Manager'
  ];

  staffList: StaffMember[] = [];

  holidayHours: HolidayHour[] = [
    {
      id: 1,
      name: 'Canada Day',
      date: 'Jul 1, 2026',
      closed: true
    },
    {
      id: 2,
      name: 'Labour Day',
      date: 'Sep 7, 2026',
      closed: false,
      openTime: '11:00 AM',
      closeTime: '6:00 PM'
    },
    {
      id: 3,
      name: 'Christmas Day',
      date: 'Dec 25, 2026',
      closed: true
    }
  ];

  advancedSettings = {
    darkMode: false,
    keepSignedIn: true,
    language: 'English',
    timeZone: 'Canada/Central (GMT-6:00)'
  };

  languages = [
    'English',
    'French',
    'Spanish'
  ];

  guestJoinLink = 'dinerly.app/join/brothers-cafe';

  showPendingRequest = true;

  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParamMap.subscribe(params => {
        const requestedTab =
          params.get('tab') as SettingsTab | null;

        this.activeTab =
          this.isValidTab(requestedTab)
            ? requestedTab
            : 'profile';
      })
    );

    this.updateCurrentTime();

    this.subscription.add(
      timer(0, 30000).subscribe(() => {
        this.updateCurrentTime();
      })
    );
  }

  private isValidTab(
    tab: SettingsTab | null
  ): tab is SettingsTab {
    return [
      'profile',
      'notification',
      'waitlist',
      'tables',
      'holiday',
      'advanced'
    ].includes(tab as SettingsTab);
  }

  private updateCurrentTime(): void {
    this.currentTimeOnly =
      new Date().toLocaleTimeString('en-CA', {
        timeZone: 'America/Winnipeg',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
  }

  approvePendingRequest(): void {
    this.showPendingRequest = false;
  }

  declinePendingRequest(): void {
    this.showPendingRequest = false;
  }

  editProfile(): void {
    alert('Connect your edit profile modal here.');
  }

  updatePackage(): void {
    alert('Connect package selection here.');
  }

  editTextTemplate(): void {
    alert('Connect text template editor here.');
  }

  editCallScript(): void {
    alert('Connect call script editor here.');
  }

  previewCall(): void {
    alert('Connect voice preview API here.');
  }

  openTerms(): void {
    alert('Open terms and conditions modal here.');
  }

  editFloorPlan(): void {
    this.router.navigate(['/restaurant/tables'], {
      queryParams: {
        mode: 'edit'
      }
    });
  }

  addStaff(): void {
    const trimmedName = this.staffName.trim();

    if (!trimmedName) {
      return;
    }

    this.staffList = [
      ...this.staffList,
      {
        id: Date.now(),
        name: trimmedName,
        role: this.staffRole,
        onFloor: false
      }
    ];

    this.staffName = '';
    this.staffRole = 'Server';
  }

  removeStaff(id: number): void {
    this.staffList =
      this.staffList.filter(staff => staff.id !== id);
  }

  toggleFloor(staff: StaffMember): void {
    staff.onFloor = !staff.onFloor;
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  addHoliday(): void {
    alert('Open add holiday modal here.');
  }

  editHoliday(holiday: HolidayHour): void {
    alert(`Edit ${holiday.name}`);
  }

  updateTimeZone(): void {
    alert('Open time zone selection modal here.');
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        this.guestJoinLink
      );

      alert('Guest join link copied.');
    } catch {
      this.fallbackCopyLink();
    }
  }

  private fallbackCopyLink(): void {
    const textArea = document.createElement('textarea');

    textArea.value = this.guestJoinLink;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand('copy');

    document.body.removeChild(textArea);

    alert('Guest join link copied.');
  }

  downloadQrCode(): void {
    const qrUrl =
      'https://api.qrserver.com/v1/create-qr-code/' +
      `?size=300x300&data=${encodeURIComponent(
        this.guestJoinLink
      )}`;

    const anchor = document.createElement('a');

    anchor.href = qrUrl;
    anchor.download = 'dinerly-guest-join-qr.png';
    anchor.target = '_blank';

    anchor.click();
  }

  toggleDarkMode(): void {
    document.body.classList.toggle(
      'restaurant-dark-mode',
      this.advancedSettings.darkMode
    );

    localStorage.setItem(
      'restaurant-dark-mode',
      String(this.advancedSettings.darkMode)
    );
  }

  get staffOnFile(): number {
    return this.staffList.length;
  }

  get notificationPercentage(): number {
    return Math.min(
      100,
      Math.round(
        (
          this.currentPlan.notificationUsed /
          this.currentPlan.notificationLimit
        ) * 100
      )
    );
  }

  get marketingPercentage(): number {
    return Math.min(
      100,
      Math.round(
        (
          this.currentPlan.marketingUsed /
          this.currentPlan.marketingLimit
        ) * 100
      )
    );
  }

  get notificationRemaining(): number {
    return Math.max(
      0,
      this.currentPlan.notificationLimit -
      this.currentPlan.notificationUsed
    );
  }

  get marketingRemaining(): number {
    return Math.max(
      0,
      this.currentPlan.marketingLimit -
      this.currentPlan.marketingUsed
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}