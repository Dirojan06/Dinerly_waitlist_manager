import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-user-hero',
  templateUrl: './waitlist-user-hero.component.html',
  styleUrls: ['./waitlist-user-hero.component.css']
})
export class WaitlistUserHeroComponent implements OnInit {

  restaurantId = 1;
  partiesWaiting = 0;
  waitMinutes = 0;
  @Input() guest: any;

@Output() logout = new EventEmitter<void>();

showProfileMenu = false;

  constructor(private waitlistApi: WaitlistApiRestaurantService) {}

  ngOnInit(): void {
    const guestData = localStorage.getItem('waitlistGuest');

    if (guestData) {
      this.guest = JSON.parse(guestData);
    }

    this.getWaitlistDashboardStatus();
  }

  getWaitlistDashboardStatus(): void {
    this.waitlistApi.getwaitlistdashBoardStatus(this.restaurantId).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.partiesWaiting = res.data.totalWaiting || 0;
          this.waitMinutes = res.data.averageWaitTime || 0;
        }
      }
    });
  }

  get guestName(): string {

  return this.guest?.guestName || this.guest?.name || 'Guest';

}

  get guestInitial(): string {
    return this.guestName.charAt(0).toUpperCase();
  }

  get guestShortName(): string {
    return this.guestName.length > 10
      ? this.guestName.substring(0, 10)
      : this.guestName;
  }

  toggleProfileMenu(): void {

  this.showProfileMenu = !this.showProfileMenu;

}

logoutGuest(): void {

  this.showProfileMenu = false;

  this.logout.emit();

}
}