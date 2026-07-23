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
  @Output() leaveSuccess = new EventEmitter<any>();
  pendingSeconds = 120;
  timerText = '';
  waitingTimerText = '';
  private pendingTimerSub?: Subscription;
  private waitingTimerSub?: Subscription;
  private pollingSub?: Subscription;
  showLeaveConfirm = false;
  isLeaving = false;
  isDarkMode = false;
  isSending = false;

  showMessageConfirm = false;

  selectedArrivalTime = '';
  specificMessage = '';
  messageFormSubmitted = false;

  arrivalTimeOptions = [
    {
      label: 'Immediately',
      value: 'IMMEDIATELY'
    },
    {
      label: '5–10 minutes',
      value: '5_10_MINUTES'
    },
    {
      label: '10–20 minutes',
      value: '10_20_MINUTES'
    },
    {
      label: '20–30 minutes',
      value: '20_30_MINUTES'
    },
    {
      label: "I'll not join",
      value: 'WILL_NOT_JOIN'
    }
  ];
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
    const storedRestaurantId = localStorage.getItem('waitlistRestaurantId');

    if (!guestData) {
      this.router.navigate(['/user']);
      return;
    }

    this.guest = JSON.parse(guestData);

    this.restaurantId = Number(storedRestaurantId);

    if (!this.restaurantId) {
      this.restaurantId = 1;
    }

    const savedTheme = localStorage.getItem('dinerly-theme');

    this.isDarkMode = savedTheme === 'dark';

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );

    this.handleStatusTimer();
    this.loadRestaurantDetails();

    if (this.guest?.status === 'NOTIFIED' && this.confirmationSent) {
      this.stopStatusPolling();
    } else {
      this.loadStatusOnce();
      this.startStatusPolling();
    }
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
    this.pollingSub = undefined;

    // Do not restart polling when confirmation was already sent
    // and the current status is NOTIFIED.
    if (
      this.guest?.status === 'NOTIFIED' &&
      this.confirmationSent
    ) {
      return;
    }

    // Polling is not required for completed statuses.
    if (
      this.guest?.status === 'SEATED' ||
      this.guest?.status === 'CANCELLED'
    ) {
      return;
    }

    this.pollingSub = interval(5000).subscribe(() => {
      if (
        this.guest?.status === 'NOTIFIED' &&
        this.confirmationSent
      ) {
        this.stopStatusPolling();
        return;
      }

      if (
        this.guest?.status === 'SEATED' ||
        this.guest?.status === 'CANCELLED'
      ) {
        this.stopStatusPolling();
        return;
      }

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
          const newStatus = newGuest.status;

          localStorage.setItem('waitlistGuest', JSON.stringify(this.guest));

          if (oldStatus !== newGuest.status) {
            this.handleStatusTimer();
          }
          if (newStatus === 'NOTIFIED') {
            this.openConfirmationModalAutomatically();
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
      this.removeWaitingTimerStorage();

      if (this.confirmationSent) {
        this.stopStatusPolling();
      }

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
      this.removeWaitingTimerStorage();
      return;
    }
    if (this.guest?.status === 'CANCELLED') {
      this.pendingTimerSub?.unsubscribe();
      this.waitingTimerSub?.unsubscribe();
      this.pollingSub?.unsubscribe();

      this.pendingTimerSub = undefined;
      this.waitingTimerSub = undefined;
      this.pollingSub = undefined;

      this.removePendingTimerStorage();
      this.removeWaitingTimerStorage();

      this.showMessageConfirm = false;

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
    this.waitingTimerSub?.unsubscribe();
    this.waitingTimerSub = undefined;

    const estimatedMinutes = Number(this.guest?.estimatedWaitTime || 0);
    const totalSeconds = estimatedMinutes * 60;

    const guestKey = this.getGuestKey();
    const storageKey = `waitingStart_${guestKey}`;

    let startTime = Number(localStorage.getItem(storageKey));

    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(storageKey, String(startTime));
    }

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      this.waitingTimerText = `${minutes}:${seconds
        .toString()
        .padStart(2, '0')}`;

      if (remainingSeconds <= 0) {
        this.waitingTimerSub?.unsubscribe();
        this.waitingTimerSub = undefined;
      }
    };

    updateTimer();

    this.waitingTimerSub = interval(1000).subscribe(() => {
      updateTimer();
    });
  }

  private removeWaitingTimerStorage(): void {
    const guestKey = this.getGuestKey();
    if (!guestKey) return;
    localStorage.removeItem(`waitingStart_${guestKey}`);

  }


  openLeaveConfirm(): void {
    this.showLeaveConfirm = true;
  }

  closeLeaveConfirm(): void {
    this.showLeaveConfirm = false;
  }


  // cancel waiting guest from waitlist
  confirmLeaveWaitlist(): void {
    const waitlistId = this.guest?.id;

    if (!this.restaurantId || !waitlistId) {
      alert('Waitlist details missing');
      return;
    }
    this.isLeaving = true;

    this.waitlistApi.leaveWaitlistTable(this.restaurantId, waitlistId).subscribe({
        next: (res : any) => {
          this.isLeaving = false;
          this.showLeaveConfirm = false;

          const guestKey = this.getGuestKey();
          if (guestKey) {
            localStorage.removeItem(`arrivalConfirmationSent_${guestKey}`);
            localStorage.removeItem(`notificationConfirmationShown_${guestKey}`);
            localStorage.removeItem(`waitingStart_${guestKey}`);
            localStorage.removeItem(`pendingStart_${guestKey}`);
          }
          this.stopStatusPolling();

          const cancelledGuest = {...this.guest, ...(res?.data || {}), status: 'CANCELLED'};

          // Keep cancelled guest for restoring

        localStorage.setItem('waitlistGuest',JSON.stringify(cancelledGuest));

        localStorage.setItem('waitlistRestaurantId',String(this.restaurantId));

        this.guest = cancelledGuest;
        this.leaveSuccess.emit(cancelledGuest);


          // localStorage.removeItem('waitlistGuest');
          // localStorage.removeItem('waitlistRestaurantId');
          // this.leaveSuccess.emit();
          // this.router.navigate(['/user']);
        },error: () => {
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

  openConfirmationModal(): void {
    this.resetMessageForm();
    this.showMessageConfirm = true;
  }

  get hasSelectedArrivalTime(): boolean {
    return this.selectedArrivalTime.trim().length > 0;
  }

  get hasSpecificMessage(): boolean {
    return this.specificMessage.trim().length > 0;
  }

  get isMessageFormValid(): boolean {
    return this.hasSelectedArrivalTime || this.hasSpecificMessage;
  }

  get showMessageValidationError(): boolean {
    return this.messageFormSubmitted && !this.isMessageFormValid;
  }

  openMessageConfirm(): void {
    this.showMessageConfirm = true;
    this.messageFormSubmitted = false;
  }

  closeMessageConfirm(): void {
    if (this.isSending) {
      return;
    }

    this.showMessageConfirm = false;
    this.resetMessageForm();
  }

  onMessageFieldChange(): void {
    if (this.isMessageFormValid) {
      this.messageFormSubmitted = false;
    }
  }

  private resetMessageForm(): void {
    this.selectedArrivalTime = '';
    this.specificMessage = '';
    this.messageFormSubmitted = false;
  }

  private openConfirmationModalAutomatically(): void {
    const guestKey = this.getGuestKey();

    if (!guestKey) {
      return;
    }

    // Do not open when confirmation was already sent
    if (this.confirmationSent) {
      return;
    }

    const popupStorageKey =
      `notificationConfirmationShown_${guestKey}`;

    const alreadyShown =
      localStorage.getItem(popupStorageKey);

    if (alreadyShown === 'true') {
      return;
    }

    this.resetMessageForm();
    this.showMessageConfirm = true;

    localStorage.setItem(popupStorageKey, 'true');
  }

  get confirmationSent(): boolean {
    const guestKey = this.getGuestKey();

    if (!guestKey) {
      return false;
    }

    return localStorage.getItem(
      `arrivalConfirmationSent_${guestKey}`
    ) === 'true';
  }

  sendArrivalMessage(): void {
    this.messageFormSubmitted = true;

    if (!this.isMessageFormValid) {
      return;
    }

    if (!this.guest?.id) {
      alert('Waitlist details are missing.');
      return;
    }

    const selectedOption = this.arrivalTimeOptions.find(
      option => option.value === this.selectedArrivalTime
    );

    const payload = {
      restaurantId: this.restaurantId,
      waitlistId: this.guest.id,
      arrivalTime: this.selectedArrivalTime || null,
      arrivalTimeLabel: selectedOption?.label || null,
      message: this.specificMessage.trim() || null
    };

    this.isSending = true;

    // dummy payload request to send arrival confirmation
    this.waitlistApi.sendArrivalConfirmation( this.restaurantId, this.guest.id, payload).subscribe({
      next: (res: any) => {
        this.isSending = false;
        this.showMessageConfirm = false;

        const guestKey = this.getGuestKey();

        if (guestKey) {
          localStorage.setItem(
            `arrivalConfirmationSent_${guestKey}`,
            'true'
          );
        }

        // Stop polling after successful confirmation
        this.stopStatusPolling();

        this.resetMessageForm();

        alert(
          res?.message ||
          'Confirmation sent successfully.'
        );
      },
      error: () => {
        this.isSending = false;

        alert(
          'Unable to send confirmation. Please try again.'
        );
      }
    });
  }

  private stopStatusPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }


  ngOnDestroy(): void {
    this.pendingTimerSub?.unsubscribe();
    this.waitingTimerSub?.unsubscribe();
    this.pollingSub?.unsubscribe();
  }

}
