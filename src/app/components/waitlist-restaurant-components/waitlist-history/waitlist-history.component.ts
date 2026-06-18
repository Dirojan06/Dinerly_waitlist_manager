import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { GetGuestHistory } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { HistoryEntry } from 'src/app/models/waitlist-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';
import { WaitlistRestaurantService } from 'src/app/services/waitlist-restaurant.service';

@Component({
  selector: 'app-waitlist-history',
  templateUrl: './waitlist-history.component.html',
  styleUrls: ['./waitlist-history.component.css']
})
export class WaitlistHistoryComponent {
 restaurantId = 1;

  history: GetGuestHistory[] = [];

  isLoading = false;
  selectedStatus = '';
  selectedDate = '';
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalElements = 0;

  constructor(private waitlistService: WaitlistApiRestaurantService) {}

  ngOnInit(): void {
    this.loadGuestHistory();
  }

  loadGuestHistory(): void {

    this.isLoading = true;

    this.waitlistService.getRestaurantGuestHistory(this.restaurantId,this.currentPage,this.pageSize,this.selectedStatus,this.selectedDate).subscribe({
        next: (res) => {
          this.history = res.data.content || [];
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },

        error: () => {
          this.isLoading = false;
          alert('Unable to load history');
        }
      });

  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadGuestHistory();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGuestHistory();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGuestHistory();
    }
  }

  getWaitTime(entry: GetGuestHistory): string {
    if (!entry.joinedAt || !entry.seatedAt) {
      return '—';
    }
    const joined = new Date(entry.joinedAt).getTime();
    const seated = new Date(entry.seatedAt).getTime();
    const minutes = Math.round((seated - joined) / 60000);
    return `${minutes} min`;
  }

  trackById(_: number, entry: GetGuestHistory): number {
    return entry.id;
  }
}
