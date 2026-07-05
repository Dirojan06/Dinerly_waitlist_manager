import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-waiting-screen',
  templateUrl: './waitlist-waiting-screen.component.html',
  styleUrls: ['./waitlist-waiting-screen.component.css']
})
export class WaitlistWaitingScreenComponent implements OnInit {

  @Input() guest: any;
  restaurantId = 1;
  @Output() leaveSuccess = new EventEmitter<void>();
  pendingSeconds = 120;
  timerText = '';
  waitingTimerText = '';
  private pendingTimerSub?: Subscription;
  private waitingTimerSub?: Subscription;
  private pollingSub?: Subscription;
  showLeaveConfirm = false;
  isLeaving = false;
  isDarkMode = false;
  stars = [1, 2, 3, 4, 5];

  rating = 0;
  comments = '';
  selectedTags: string[] = [];
  feedbackTags = [
    'Friendly staff',
    'Quick service',
    'Great ambiance',
    'Clean table',
    'Tasty food',
    'Good hospitality'
  ];

  isSubmittingFeedback = false;
  feedbackSubmitted = false;
  restaurant?: Restaurant;

  constructor(private waitlistApi: WaitlistApiRestaurantService, private router: Router) { }

  ngOnInit(): void {

    const guestData = localStorage.getItem('waitlistGuest');

    if (!guestData) {
      this.router.navigate(['/user']);
      return;
    }
    this.guest = JSON.parse(guestData);
    this.handleStatusTimer();
    this.loadStatusOnce();
    this.startStatusPolling();

    const savedTheme = localStorage.getItem('dinerly-theme');

    this.isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );

    this.restaurantId = Number(localStorage.getItem('waitlistRestaurantId'));
    this.loadRestaurantDetails();
  }

  loadRestaurantDetails(): void {
    this.waitlistApi.getRestaurantDetails().subscribe({
      next: (res) => {
        if (res?.success && res?.data?.length) {
          this.restaurant = res.data.find(item => item.id === this.restaurantId) || res.data[0];
        }
      },
      error: () => {
        console.log('Unable to load restaurant details');
      }
    });
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
          const newGuest = res.data;

          const oldStatus = this.guest?.status;

          this.guest = newGuest;

          localStorage.setItem('waitlistGuest', JSON.stringify(this.guest));

          if (oldStatus !== newGuest.status) {

            this.handleStatusTimer();

          }

        }
      },
      error: () => {
        console.log('Unable to load guest status');
      }
    });
  }
  handleStatusTimer(): void {
    if (this.guest?.status === 'PENDING') {
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


  private getGuestKey(): string {
    return this.guest?.guestPhone || this.guest?.phone;
  }

  startWaitingCountdown(): void {

    if (this.waitingTimerSub) {
      this.waitingTimerSub.unsubscribe();
      this.waitingTimerSub = undefined;
    }

    const estimatedMinutes = Number(this.guest?.estimatedWaitTime || 0);
    let remainingSeconds = estimatedMinutes * 60;

    const updateTimer = () => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      this.waitingTimerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (remainingSeconds <= 0) {
        this.waitingTimerText = '0:00';
        this.waitingTimerSub?.unsubscribe();
        this.waitingTimerSub = undefined;
        return;
      }
      remainingSeconds--;
    };

    updateTimer();
    this.waitingTimerSub = interval(1000).subscribe(() => {
      updateTimer();
    });

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

  goBackButtonMethod() {
    this.router.navigate(['/user']);
  }


  get partiesAhead(): number {
    return this.guest?.position ? this.guest.position - 1 : 0;
  }
  setRating(value: number) {
    this.rating = value;
  }

  toggleTag(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(item => item !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  submitFeedback() {

    if (!this.guest?.id) {
      alert('Waitlist ID missing');
      return;
    }

    if (this.rating === 0) {
      alert('Please select rating');
      return;
    }

    const payload = {
      waitlistId: this.guest.id,
      rating: this.rating,
      comments: this.comments,
      tags: this.selectedTags
    };

    this.isSubmittingFeedback = true;
    this.waitlistApi.submitFeedback(payload).subscribe({
      next: () => {
        this.isSubmittingFeedback = false;
        this.feedbackSubmitted = true;
        setTimeout(() => {
          this.router.navigate(['/user']);
        }, 3000);
      },
      error: () => {
        this.isSubmittingFeedback = false;
        alert('Unable to submit feedback');
      }
    });
  }

  get guestName(): string {
    return this.guest?.guestName || this.guest?.name || 'Guest';
  }

  get guestPhone(): string {
    return this.guest?.guestPhone || this.guest?.phone || '-';
  }

  get guestPreference(): string {
    const value = this.guest?.preference;

    if (!value) return 'No preference';

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  get waitingMinutesOnly(): string {
    if (this.guest?.status !== 'WAITING') return '0';

    const parts = this.waitingTimerText.split(':');
    return parts[0] || '0';
  }

  get stepWaitingActive(): boolean {
    return this.guest?.status === 'WAITING';
  }

  get stepNotifiedActive(): boolean {
    return this.guest?.status === 'NOTIFIED';
  }

  get stepSeatedActive(): boolean {
    return this.guest?.status === 'SEATED';
  }

  ngOnDestroy(): void {
    this.pendingTimerSub?.unsubscribe();
    this.waitingTimerSub?.unsubscribe();
    this.pollingSub?.unsubscribe();
  }

}
