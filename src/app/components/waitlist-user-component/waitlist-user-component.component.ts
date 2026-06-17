import { Component } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-component',
  templateUrl: './waitlist-user-component.component.html',
  styleUrls: ['./waitlist-user-component.component.css']
})
export class WaitlistUserComponentComponent {

  joinedGuest: any = null;
  restaurantId = 1;
  onJoinedWaitlist(guest: any): void {
    this.joinedGuest = guest;
  }

  onLeaveSuccess(): void {
    this.joinedGuest = null;
  }
}
