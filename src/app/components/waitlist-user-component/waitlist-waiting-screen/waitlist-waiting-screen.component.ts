import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-waiting-screen',
  templateUrl: './waitlist-waiting-screen.component.html',
  styleUrls: ['./waitlist-waiting-screen.component.css']
})
export class WaitlistWaitingScreenComponent implements OnInit {

  @Input() guest: any;
  @Input() restaurantId!: number;
  @Output() leaveSuccess = new EventEmitter<void>();
  countdown = 60;
  timerText = '2:00';
  private timerSub?: Subscription;
  private pollingSub?: Subscription;
  showLeaveConfirm = false;
  isLeaving = false;

  constructor(private waitlistApi: WaitlistApiRestaurantService) { }

  ngOnInit(): void {

    if (!this.guest) return;
    this.loadStatusOnce(true);
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

  startTimer() {

    this.timerSub = interval(1000).subscribe(() => {
      this.countdown--;
      const minutes = Math.floor(this.countdown / 60);
      const seconds = this.countdown % 60;
      this.timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (this.countdown <= 0) {
        this.timerSub?.unsubscribe();
      }
    });
  }

  startStatusPolling(): void {

    this.pollingSub?.unsubscribe();
    this.pollingSub = interval(5000).subscribe(() => {
      this.loadStatusOnce();

    });

  }

  loadStatusOnce(isInitialLoad: boolean = false): void {

    if (!this.guest) return;
    const payload = {
      restaurantId: this.restaurantId.toString(),
      phone: this.guest.guestPhone || this.guest.phone
    };

    this.waitlistApi.getWaitlistStatus(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.guest = res.data;
          if (this.guest.status === 'PENDING') {

            if (isInitialLoad) {
              this.startTimer();
              this.startStatusPolling();
            }

          }
          if (this.guest.status === 'WAITING') {
            this.startStatusPolling();
          }

          if (this.guest.status === 'NOTIFY') {
            this.startStatusPolling();
          }

          if(this.guest.status === 'SEATED'){
            this.timerSub?.unsubscribe();
            this.pollingSub?.unsubscribe();
          }
        }
      },
      error: () => {
        console.log('Unable to load guest status');
      }
    });
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
          this.leaveSuccess.emit();
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

    this.timerSub?.unsubscribe();
    this.pollingSub?.unsubscribe();

  }

}
