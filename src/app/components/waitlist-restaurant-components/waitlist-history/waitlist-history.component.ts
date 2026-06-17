import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { HistoryEntry } from 'src/app/models/waitlist-restaurant.model';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';
import { WaitlistRestaurantService } from 'src/app/services/waitlist-restaurant.service';

@Component({
  selector: 'app-waitlist-history',
  templateUrl: './waitlist-history.component.html',
  styleUrls: ['./waitlist-history.component.css']
})
export class WaitlistHistoryComponent {
history: HistoryEntry[] = [];
  private sub = new Subscription();

  get seatedCount(): number { return this.history.filter(h => h.status === 'seated').length; }
  get noShowCount(): number { return this.history.filter(h => h.status === 'noshow').length; }

  constructor(private waitlistService: WaitlistRestaurantService, public modalService: WaitlistRestaurantModalService) {}

  ngOnInit(): void {
    this.sub.add(this.waitlistService.history$.subscribe(h => this.history = h));
  }
  ngOnDestroy(): void { this.sub.unsubscribe(); }

  trackById(_: number, h: HistoryEntry): number { return h.id; }
}
