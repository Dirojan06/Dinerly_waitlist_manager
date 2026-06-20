import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { CancelledGuest, NotifiedGuest, PendingGuest, SeatedGuest, tableList, WaitingGuest } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';
import { WaitlistRestaurantService } from 'src/app/services/waitlist-restaurant.service';

type FilterType = 'all' | 'waiting' | 'table-ready' | 'notified';

@Component({
  selector: 'app-waitlist-active-list',
  templateUrl: './waitlist-active-list.component.html',
  styleUrls: ['./waitlist-active-list.component.css']
})
export class WaitlistActiveListComponent implements OnInit, OnDestroy {

  restaurantId = 1;
  private sub = new Subscription();
  pendingGuests: PendingGuest[] = [];
  waitingGuests: WaitingGuest[] = [];
  notifiedGuests: NotifiedGuest[] = [];
  seatedGuests: SeatedGuest[] = [];
  cancelledGuest: CancelledGuest[] = [];
  selectedGuest: PendingGuest | null = null;
  showApproveModal = false;
  selectedPosition = 1;
  selectedWaitTime = 20;
  waitTimeOptions = [5, 10, 15, 20, 25, 30];
  isLoading = false;
  isApproving = false;
  isRejecting = false;
  selectedStatus = '';
  selectedDate = '';
  showRejectModal: boolean = false;
  private refreshInterval: any;
  currentDateTime = '';
  private clockInterval: any;

  // pagination
  itemsPerPage = 5;
  pendingPage = 1;
  waitingPage = 1;
  notifiedPage = 1;
  seatedPage = 1;
  cancelledPage = 1

  //for get available table
  showTable: boolean = false;
  tables: tableList[] = [];
  selectedTable: tableList | null = null;
  openTables: tableList[] = [];

  constructor(public waitlistService: WaitlistApiRestaurantService, private waitlistUIService: WaitlistRestaurantService, public modalService: WaitlistRestaurantModalService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadWaitlistData();
    this.refreshInterval = setInterval(() => {
      this.loadWaitlistData();
    }, 2000);
    this.updateDateTime();

    this.clockInterval = setInterval(() => {
      this.updateDateTime();

    }, 1000);
  }

  updateDateTime(): void {
    this.currentDateTime = new Date().toLocaleString('en-IN', {
      timeZone: 'America/Toronto',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  loadWaitlistData(): void {
    this.loadPendingGuests();
    this.loadWaitingGuests();
    this.loadNotifiedGuests();
    this.getRestaurantTables();
  }

  // Load pending guests based on selected filters
  loadPendingGuests(): void {
    this.isLoading = true;
    this.selectedStatus = "PENDING"
    this.waitlistService.getGuestsStatus(this.restaurantId, this.selectedStatus, this.selectedDate).subscribe({
      next: (response) => {
        this.pendingGuests = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load pending guests');
      }
    });
  }

  // Load waiting guests for the restaurant
  loadWaitingGuests(): void {
    this.isLoading = true;
    this.selectedStatus = "WAITING"
    this.waitlistService.getWaitingGuests(this.restaurantId, this.selectedStatus, this.selectedDate).subscribe({
      next: (response) => {
        this.waitingGuests = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load waiting guests');
      }
    });

  }

  // Load notified guests for the restaurant
  loadNotifiedGuests(): void {
    this.isLoading = true;
    this.selectedStatus = "NOTIFIED"
    this.waitlistService.getNotifiedGuests(this.restaurantId, this.selectedStatus, this.selectedDate).subscribe({
      next: (response) => {
        this.notifiedGuests = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load notified guests');
      }
    });

  }

  loadSeatedGuests(): void {
    this.isLoading = true;
    this.selectedStatus = "SEATED"
    this.waitlistService.getSeatedGuests(this.restaurantId, this.selectedStatus, this.selectedDate).subscribe({
      next: (response) => {
        this.seatedGuests = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load seated guests');
      }
    });
  }

  loadCancelledGuests(): void {
    this.isLoading = true;
    this.selectedStatus = "CANCELLED"
    this.waitlistService.getCancelledGuests(this.restaurantId, this.selectedStatus, this.selectedDate).subscribe({
      next: (response) => {
        this.cancelledGuest = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load cancelled guests');
      }
    });
  }



  openApproveModal(guest: any) {
    this.selectedGuest = guest;
    this.selectedWaitTime = 5;
    this.showApproveModal = true;
  }

  approveSelectedGuest() {

    if (!this.selectedGuest) return;

    if (this.selectedWaitTime == null) {
      alert('Please select wait time');
      return;
    }
    this.isApproving = true;
    this.waitlistService.approveGuest(this.restaurantId, this.selectedGuest!.id, {
      estimatedWaitTime: this.selectedWaitTime
    }).subscribe({
      next: (res) => {
        const approvedGuest = res.data;
        this.pendingGuests = this.pendingGuests.filter(g => g.id !== approvedGuest.id);
        this.waitingGuests = [approvedGuest, ...this.waitingGuests];
        this.loadWaitlistData();
        this.isApproving = false;
        this.closeApproveModal();
      }, error: () => {
        this.isLoading = false;
        alert('Unable to approve the guests');
        this.isApproving = false;
        this.closeApproveModal();
      }
    });
  }

  closeApproveModal(): void {
    this.selectedGuest = null;
    this.showApproveModal = false;
  }


  openRejectModal(guest: any) {
    this.selectedGuest = guest;
    this.showRejectModal = true
  }

  rejectGuest(id: any): void {
    if (!this.selectedGuest) return;
    this.isRejecting = true;
    this.waitlistService.rejectGuest(this.restaurantId, id).subscribe({
      next: () => {
        this.isRejecting = false;
        this.closeRejectModel();
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to remove the guests');
        this.isRejecting = false;
        this.closeRejectModel();
      }
    });
  }
  closeRejectModel() {
    this.showRejectModal = false;
  }

  notifyToGuestCall(guestid: any, time: any, position: any) {

    this.waitlistService.notifyToGuest(this.restaurantId, guestid, {
      estimatedWaitTime: time, position: position
    }).subscribe({
      next: (res) => {
        const notifiedGuest = res.data;
        this.waitingGuests = this.waitingGuests.filter(g => g.id !== notifiedGuest.id);
        this.notifiedGuests = [notifiedGuest, ...this.notifiedGuests];
        this.loadWaitlistData();
      }, error: () => {
        this.isLoading = false;
        alert('Unable to notify the guests');
      }
    });
  }

  openAvailableTableModal(guest: any) {
    this.showTable = true;
    this.selectedGuest = guest;

  }

  closeAvailableTabletModal() {
    this.showTable = false;
  }

  seatedGuestToTable(guestid: any, table: tableList | null) {
    if (!table) {
      alert('Please select a table');
      return;
    }
    this.isLoading = true;

    forkJoin({
      tableStatus: this.waitlistService.updateTableStatus(this.restaurantId, table.id, 'OCCUPIED'),
      seatedGuest: this.waitlistService.seatedGuest(this.restaurantId, guestid, { tableName: table.tableNumber })
    }).subscribe({
      next: ({ tableStatus, seatedGuest }) => {
        this.isLoading = false;
        const guest = seatedGuest.data;
        this.notifiedGuests = this.notifiedGuests.filter(
          g => g.id !== guest.id
        );
        this.seatedGuests = [guest, ...this.seatedGuests];
        this.showTable = false;
        this.selectedTable = null;
        this.loadNotifiedGuests()
        this.notificationService.triggerRestaurantRefresh();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Seat guest failed:', err);
        alert('Unable to seat guest. Please try again.');
      }
    });
  }

  addGuestbyrestaurant() {
    let name = '';
    let phone = 0;

    let partySize = 0
    let preference = ''
    let notes = ''
    let position = 0
    let estimatedWaitTime = 0;
    this.waitlistService.addGuestInWaitlist(this.restaurantId, {
      name: name,
      phone: phone,
      partySize: partySize,
      preference: preference,
      notes: notes,
      position: position,
      estimatedWaitTime: estimatedWaitTime
    }).subscribe({
      next: (res) => {

      }, error: () => {
        this.isLoading = false;
        alert('Unable to approve the guests');

      }
    });
  }

  getRestaurantTables() {

    this.waitlistService.getRestaurantTableslist(this.restaurantId).subscribe({
      next: (res) => {
        this.tables = res.data;
        this.openTables = this.tables.filter(

          (table: any) => table.status === 'OPEN'

        );
      }, error: () => {
        alert('Unable to load the table');
      }
    })
  }

  getActualWaitingTime(joinedAt?: string, notifiedAt?: string): string {
    if (!joinedAt || !notifiedAt) return '-';
    const joinedTime = new Date(joinedAt).getTime();
    const notifiedTime = new Date(notifiedAt).getTime();
    const diffMs = notifiedTime - joinedTime;
    if (diffMs < 0) return '-';
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatDateTime(date?: string): string {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getInitials(name: string): string { return this.waitlistUIService.getInitials(name); }
  getAvatarColor(id: number) { return this.waitlistUIService.getAvatarColor(id); }

  trackBypendingGuest(_: number, g: PendingGuest): number { return g.id; }
  trackBywaitingGuest(_: number, g: WaitingGuest): number { return g.id; }
  trackBynotifyGuest(_: number, g: NotifiedGuest): number { return g.id; }
  trackByseatedGuest(_: number, g: SeatedGuest): number { return g.id; }
  trackBycancelledGuest(_: number, g: CancelledGuest): number { return g.id; }

  // pagination part ///////////////////////////////////////////////////////////////////////

  get pagedPendingGuests(): PendingGuest[] {
    return this.getPagedData(this.pendingGuests, this.pendingPage);
  }

  get pagedWaitingGuests(): WaitingGuest[] {
    return this.getPagedData(this.waitingGuests, this.waitingPage);
  }

  get pagedNotifiedGuests(): NotifiedGuest[] {
    return this.getPagedData(this.notifiedGuests, this.notifiedPage);
  }

  get pagedSeatedGuests(): SeatedGuest[] {
    return this.getPagedData(this.seatedGuests, this.seatedPage);
  }

  get pagedCancelledGuests(): CancelledGuest[] {
    return this.getPagedData(this.cancelledGuest, this.seatedPage);
  }
  get pendingTotalPages(): number {
    return this.getTotalPages(this.pendingGuests);
  }

  get waitingTotalPages(): number {
    return this.getTotalPages(this.waitingGuests);
  }

  get notifiedTotalPages(): number {
    return this.getTotalPages(this.notifiedGuests);
  }

  get seatedTotalPages(): number {
    return this.getTotalPages(this.seatedGuests);
  }

  get cancelledTotalPages(): number {
    return this.getTotalPages(this.cancelledGuest);
  }

  private getPagedData<T>(data: T[], page: number): T[] {
    const start = (page - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  }

  private getTotalPages(data: any[]): number {
    return Math.ceil(data.length / this.itemsPerPage) || 1;
  }

  changePage(
    type: 'pending' | 'waiting' | 'notified' | 'seated' | 'cancelled',
    direction: 'next' | 'prev'
  ): void {

    if (type === 'pending') {
      if (direction === 'next' && this.pendingPage < this.pendingTotalPages) {
        this.pendingPage++;
      }

      if (direction === 'prev' && this.pendingPage > 1) {
        this.pendingPage--;
      }
    }

    if (type === 'waiting') {
      if (direction === 'next' && this.waitingPage < this.waitingTotalPages) {
        this.waitingPage++;
      }

      if (direction === 'prev' && this.waitingPage > 1) {
        this.waitingPage--;
      }
    }

    if (type === 'notified') {
      if (direction === 'next' && this.notifiedPage < this.notifiedTotalPages) {
        this.notifiedPage++;
      }

      if (direction === 'prev' && this.notifiedPage > 1) {
        this.notifiedPage--;
      }
    }

    if (type === 'seated') {
      if (direction === 'next' && this.seatedPage < this.seatedTotalPages) {
        this.seatedPage++;
      }

      if (direction === 'prev' && this.seatedPage > 1) {
        this.seatedPage--;
      }
    }

    if (type === 'cancelled') {
      if (direction === 'next' && this.cancelledPage < this.cancelledTotalPages) {
        this.cancelledPage++;
      }

      if (direction === 'prev' && this.cancelledPage > 1) {
        this.cancelledPage--;
      }
    }
  }


  ngOnDestroy(): void {
    this.sub.unsubscribe(); if (this.clockInterval) {

      clearInterval(this.clockInterval);

    }
  }



}
