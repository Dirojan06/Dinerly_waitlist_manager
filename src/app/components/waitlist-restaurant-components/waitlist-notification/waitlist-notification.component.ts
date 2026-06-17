import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Guest } from 'src/app/models/waitlist-restaurant.model';
import { WaitlistRestaurantService } from 'src/app/services/waitlist-restaurant.service';

@Component({
  selector: 'app-waitlist-notification',
  templateUrl: './waitlist-notification.component.html',
  styleUrls: ['./waitlist-notification.component.css']
})
export class WaitlistNotificationComponent {
  queue: Guest[] = [];
  smsTemplate = '';
  private sub = new Subscription();

  constructor(private waitlistService: WaitlistRestaurantService) { }

  ngOnInit(): void {
    this.sub.add(
      this.waitlistService.guests$.subscribe(() => {
        this.queue = this.waitlistService.getNotifyQueue();
      })
    );
    this.sub.add(
      this.waitlistService.smsTemplate$.subscribe(t => this.smsTemplate = t)
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  saveTemplate(): void {
    this.waitlistService.updateSmsTemplate(this.smsTemplate);
    alert('SMS template saved!');
  }

  getInitials(name: string): string { return this.waitlistService.getInitials(name); }
  getAvatarColor(id: number) { return this.waitlistService.getAvatarColor(id); }

  trackByGuest(_: number, g: Guest): number { return g.id; }
}
