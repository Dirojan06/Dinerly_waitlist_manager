import { Component } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-hero',
  templateUrl: './waitlist-user-hero.component.html',
  styleUrls: ['./waitlist-user-hero.component.css']
})
export class WaitlistUserHeroComponent {
partiesWaiting = 6;
  waitMinutes = 22;
}
