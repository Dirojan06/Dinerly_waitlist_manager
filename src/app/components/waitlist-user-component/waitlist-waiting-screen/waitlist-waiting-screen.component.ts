import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-waiting-screen',
  templateUrl: './waitlist-waiting-screen.component.html',
  styleUrls: ['./waitlist-waiting-screen.component.css']
})
export class WaitlistWaitingScreenComponent implements OnInit {

  @Input() guest: any;
  restaurantId = '1';
  @Output() leaveSuccess = new EventEmitter<void>();
  pendingSeconds = 120;
  timerText = '';
  waitingTimerText = '0:00';
  private pendingTimerSub?: Subscription;
  private waitingTimerSub?: Subscription;
  private pollingSub?: Subscription;
  showLeaveConfirm = false;
  isLeaving = false;

  constructor(private waitlistApi: WaitlistApiRestaurantService, private router: Router) { }

  ngOnInit(): void {

    const guestData = localStorage.getItem('waitlistGuest');

    if (!guestData) {
      this.router.navigate(['/user']);
      return;
    }

    this.guest = JSON.parse(guestData);
    this.loadStatusOnce();
    this.startStatusPolling();
  }

  restoreFromStorage(): void {

    const storedGuest = localStorage.getItem('waitlistGuest');
    const storedRestaurantId = localStorage.getItem('waitlistRestaurantId');
    if (!this.guest && storedGuest) {
      this.guest = JSON.parse(storedGuest);
    }
  }

  get activeStepIndex(): number {
    switch (this.guest?.status) {
      case 'PENDING':
        return 0;
      case 'WAITING':
        return 1;
      case 'NOTIFIED':
        return 2;
      case 'SEATED':
        return 3;
      default:
        return 0;
    }
  }

  startStatusPolling(): void {

    this.pollingSub?.unsubscribe();
    this.pollingSub = interval(5000).subscribe(() => {
      this.loadStatusOnce();
    });

  }

  loadStatusOnce(): void {

    if (!this.guest) return;
    const payload = {
      restaurantId: this.restaurantId,
      phone: this.guest.guestPhone || this.guest.phone
    };

    this.waitlistApi.getWaitlistStatus(payload).subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          this.guest = res.data;
          localStorage.setItem('waitlistGuest', JSON.stringify(this.guest));
          this.handleStatusTimer();

        }
      },
      error: () => {
        console.log('Unable to load guest status');
      }
    });
  }
  handleStatusTimer(): void {
    if (this.guest?.status === 'PENDING') {
      this.startPendingTimer();
      this.waitingTimerSub?.unsubscribe();
      this.waitingTimerSub = undefined;
      return;
    }
    if (this.guest?.status === 'WAITING') {
      this.pendingTimerSub?.unsubscribe();
      this.pendingTimerSub = undefined;
      this.removePendingTimerStorage();
      this.startWaitingCountdown();
      return;
    }
    if (this.guest?.status === 'NOTIFIED') {
      this.pendingTimerSub?.unsubscribe();
      this.waitingTimerSub?.unsubscribe();
      this.pendingTimerSub = undefined;
      this.waitingTimerSub = undefined;
      this.removePendingTimerStorage();
      return;
    }
    if (this.guest?.status === 'SEATED') {
      this.pendingTimerSub?.unsubscribe();
      this.waitingTimerSub?.unsubscribe();
      this.pollingSub?.unsubscribe();
      this.pendingTimerSub = undefined;
      this.waitingTimerSub = undefined;
      this.pollingSub = undefined;
      this.removePendingTimerStorage();
      return;
    }

  }

  private removePendingTimerStorage(): void {
    const guestKey = this.getGuestKey();
    if (!guestKey) return;
    localStorage.removeItem(`pendingStart_${guestKey}`);
  }

  startPendingTimer(): void {
    if (!this.guest) return;
    if (this.pendingTimerSub) return;
    const guestKey = this.getGuestKey();
    const localStartKey = `pendingStart_${guestKey}`;
    let localStart = localStorage.getItem(localStartKey);

    if (!localStart) {
      localStart = Date.now().toString();
      localStorage.setItem(localStartKey, localStart);
    }
    const startTime = Number(localStart);
    const endTime = startTime + this.pendingSeconds * 1000;
    const updateTimer = () => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 0) {
        this.timerText = '0:00';
        this.pendingTimerSub?.unsubscribe();
        this.pendingTimerSub = undefined;
        return;
      }
      this.timerText = this.formatTime(remainingMs);
    };

    updateTimer();

    this.pendingTimerSub = interval(1000).subscribe(updateTimer);

  }

  private getGuestKey(): string {
    return this.guest?.guestPhone || this.guest?.phone;
  }

  startWaitingCountdown(): void {
    if (this.waitingTimerSub) return;

    const estimatedMinutes = this.guest?.estimatedWaitTime || 0;

    const approvedAt =
      this.guest?.approvedAt ||
      this.guest?.approvedTime ||
      this.guest?.waitingStartedAt;

    let startTime = this.parseCreatedTime(approvedAt);

    if (!startTime) {
      const guestKey = this.guest.id || this.guest.guestPhone || this.guest.phone;
      const waitingStartKey = `waitingStart_${guestKey}`;

      let localStart = localStorage.getItem(waitingStartKey);

      if (!localStart) {
        localStart = Date.now().toString();
        localStorage.setItem(waitingStartKey, localStart);
      }

      startTime = Number(localStart);
    }

    const endTime = startTime + estimatedMinutes * 60 * 1000;

    const updateTimer = () => {
      const remainingMs = endTime - Date.now();

      if (remainingMs <= 0) {
        this.waitingTimerText = '0:00';
        this.waitingTimerSub?.unsubscribe();
        this.waitingTimerSub = undefined;
        return;
      }

      this.waitingTimerText = this.formatTime(remainingMs);
    };

    updateTimer();

    this.waitingTimerSub = interval(1000).subscribe(() => {
      updateTimer();
    });
  }
  private parseCreatedTime(createdTime: any): number | null {
    if (!createdTime) return null;

    // Already timestamp number

    if (typeof createdTime === 'number') {
      return createdTime;
    }

    // Timestamp string

    if (!isNaN(Number(createdTime))) {
      return Number(createdTime);
    }

    // Try normal JS date parsing

    const normalDate = new Date(createdTime).getTime();
    if (!isNaN(normalDate)) {
      return normalDate;
    }
    return null;
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  openLeaveConfirm(): void {
    this.showLeaveConfirm = true;
  }

  closeLeaveConfirm(): void {
    this.showLeaveConfirm = false;
  }

  confirmLeaveWaitlist(): void {
    const waitlistId = this.guest?.id;

    if (!this.restaurantId || !waitlistId) {
      alert('Waitlist details missing');
      return;
    }

    this.isLeaving = true;

    this.waitlistApi
      .leaveWaitlistTable(this.restaurantId, waitlistId)
      .subscribe({
        next: () => {
          this.isLeaving = false;
          this.showLeaveConfirm = false;
          localStorage.removeItem('waitlistGuest');
          localStorage.removeItem('waitlistRestaurantId');
          this.leaveSuccess.emit();
          this.router.navigate(['/user']);
        },
        error: () => {
          this.isLeaving = false;
          alert('Unable to leave waitlist. Please try again.');
        }
      });
  }


  get partiesAhead(): number {
    return this.guest?.position ? this.guest.position - 1 : 0;
  }

  ngOnDestroy(): void {
    this.pendingTimerSub?.unsubscribe();
    this.waitingTimerSub?.unsubscribe();
    this.pollingSub?.unsubscribe();
  }

}
