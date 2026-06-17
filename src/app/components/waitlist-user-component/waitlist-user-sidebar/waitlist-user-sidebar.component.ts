import { Component } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl: './waitlist-user-sidebar.component.html',
  styleUrls: ['./waitlist-user-sidebar.component.css']
})
export class WaitlistUserSidebarComponent {

  joinWaitlist(): void {
    alert('Join Waitlist — connect to your waitlist service here.');
  }

  checkStatus(): void {
    alert('Check Status — connect to your backend here.');
  }

  bookTable(): void {
    alert('Book a Table — connect to reservation service here.');
  }

  updatePhone(): void {
    alert('Update phone number flow.');
  }
}
