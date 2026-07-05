import { Component, OnInit } from '@angular/core';
import { GetGuestHistory } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-restaurant-history',
  templateUrl: './waitlist-restaurant-history.component.html',
  styleUrls: ['./waitlist-restaurant-history.component.css']
})
 export class WaitlistRestaurantHistoryComponent implements OnInit{

  restaurantId = 1;
  history: GetGuestHistory[] = [];
  isLoading = false;
  selectedStatus = '';
  selectedStatusCSV = ''
  selectedDate = '';
  selectedDateCSV = ''
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalElements = 0;
  jumpPageInput: number | null = null;
  isDownloadingCSV: boolean = false;

  

  searchText = '';

  constructor(private waitlistService: WaitlistApiRestaurantService) { }

  ngOnInit(): void {
    this.loadGuestHistory();
  }

  loadGuestHistory(): void {

    this.isLoading = true;

    this.waitlistService.getRestaurantGuestHistory(this.restaurantId, this.currentPage, this.pageSize, this.selectedStatus, this.selectedDate).subscribe({
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
    this.selectedDateCSV = this.selectedDate;
    this.selectedStatusCSV = this.selectedStatus
    this.currentPage = 0;
    this.loadGuestHistory();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGuestHistory();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGuestHistory();
    }
  }

  jumpToPage(): void {
    if (!this.jumpPageInput) {
      alert('Please enter page number');
      return;
    }

    if (this.jumpPageInput < 1 || this.jumpPageInput > this.totalPages) {
      alert(`Please enter page between 1 and ${this.totalPages}`);
      return;
    }

    this.currentPage = this.jumpPageInput - 1;
    this.loadGuestHistory();
    this.jumpPageInput = null;
  }

  get pages(): number[] {

    const maxVisiblePages = 5;
    if (this.totalPages <= maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    let startPage = this.currentPage - 2;

    let endPage = this.currentPage + 2;

    if (startPage < 0) {
      startPage = 0;
      endPage = maxVisiblePages - 1;
    }

    if (endPage >= this.totalPages) {
      endPage = this.totalPages - 1;
      startPage = this.totalPages - maxVisiblePages;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  get startItem(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;

  }

  get endItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
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

  exportHistoryCsv() {

    this.isDownloadingCSV = true;


    this.waitlistService

      .exportGuestHistoryCsv(this.restaurantId, this.selectedStatusCSV, this.selectedDateCSV)

      .subscribe({

        next: (blob: Blob) => {

          const fileName = `guest-history-${new Date().toISOString().slice(0, 10)}.csv`;

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');

          a.href = url;

          a.download = fileName;

          a.click();

          window.URL.revokeObjectURL(url);

          this.isDownloadingCSV = false;

        },

        error: (err) => {
          this.isDownloadingCSV = false;
          console.error('CSV export failed:', err);

          alert('Failed to export CSV');

        }

      });
  }

  get currentTimeOnly(): string {
    return new Date().toLocaleTimeString('en-IN', {
      timeZone: 'America/Toronto',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  todayLabel = new Date().toLocaleDateString('en-IN', {
    timeZone: 'America/Toronto',
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.onFilterChange();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.selectedStatusCSV = '';
    this.selectedDateCSV = '';
    this.currentPage = 0;
    this.loadGuestHistory();
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '';
  }

  formatStatus(status: string): string {
    if (status === 'NO_SHOW') return 'No-show';
    if (status === 'CANCELLED') return 'Removed';
    if (status === 'SEATED') return 'Seated';
    if (status === 'PENDING') return 'Pending';
    if (status === 'WAITING') return 'Waiting';
    if (status === 'NOTIFIED') return 'Notified';
    return status;
  }

  getStatusClass(status: string): string {
    if (status === 'SEATED') return 'seated';
    if (status === 'CANCELLED') return 'removed';
    if (status === 'NO_SHOW') return 'no-show';
    if (status === 'PENDING') return 'pending';
    if (status === 'WAITING') return 'waiting';
    if (status === 'NOTIFIED') return 'notified';
    return '';
  }

  get filteredHistory(): GetGuestHistory[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.history;
    }

    return this.history.filter(entry =>
      entry.guestName?.toLowerCase().includes(search)
    );
  }

  trackById(_: number, entry: GetGuestHistory): number {
    return entry.id;
  }
}
