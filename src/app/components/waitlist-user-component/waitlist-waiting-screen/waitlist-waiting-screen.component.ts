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
  restaurantId= '1';
  @Output() leaveSuccess = new EventEmitter<void>();
  pendingSeconds = 120;
  timerText = '2:00';
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
      return;
    }

    if (this.guest?.status === 'WAITING') {
      this.pendingTimerSub?.unsubscribe();
      this.startWaitingCountdown();
      return;
    }

    if (this.guest?.status === 'NOTIFIED') {
      this.pendingTimerSub?.unsubscribe();
      this.waitingTimerSub?.unsubscribe();
      return;
    }

    if (this.guest?.status === 'SEATED') {
      this.pendingTimerSub?.unsubscribe();
      this.waitingTimerSub?.unsubscribe();
      this.pollingSub?.unsubscribe();
      return;
    }
  }

  startPendingTimer(): void {
    if (this.pendingTimerSub) return;
    const createdTime =
      this.guest?.createdAt ||
      this.guest?.joinedAt ||
      this.guest?.createdDate;
    let endTime: number;
    if (createdTime) {
      endTime = new Date(createdTime).getTime() + 2 * 60 * 1000;
    } else {
      const localStartKey = `pendingStart_${this.guest.id || this.guest.guestPhone || this.guest.phone}`;
      let localStart = localStorage.getItem(localStartKey);
      if (!localStart) {
        localStart = Date.now().toString();
        localStorage.setItem(localStartKey, localStart);
      }
      endTime = +localStart + 2 * 60 * 1000;
    }

    this.pendingTimerSub = interval(1000).subscribe(() => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 0) {
        this.timerText = '0:00';
        this.pendingTimerSub?.unsubscribe();
        return;
      }
      this.timerText = this.formatTime(remainingMs);
    });
  }

  startWaitingCountdown(): void {
    this.waitingTimerSub?.unsubscribe();
    const estimatedMinutes = this.guest?.estimatedWaitTime || 0;
    const approvedAt = this.guest?.approvedAt || this.guest?.approvedTime || this.guest?.waitingStartedAt;
    if (!approvedAt) {
      this.waitingTimerText = `${estimatedMinutes}:00`;
      return;
    }

    const endTime = new Date(approvedAt).getTime() + estimatedMinutes * 60 * 1000;
    this.waitingTimerSub = interval(1000).subscribe(() => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 0) {
        this.waitingTimerText = '0:00';
        this.waitingTimerSub?.unsubscribe();
        return;
      }
      this.waitingTimerText = this.formatTime(remainingMs);
    });

  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
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
