import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifiedGuest, PendingGuest, SeatedGuest, WaitingGuest } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
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

  constructor(public waitlistService: WaitlistApiRestaurantService, private waitlistUIService: WaitlistRestaurantService, public modalService: WaitlistRestaurantModalService) { }

  ngOnInit(): void {
    this.loadWaitlistData();
  }
  loadWaitlistData(): void {
    this.loadPendingGuests();
    this.loadWaitingGuests();
    this.loadNotifiedGuests();
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
        this.waitingGuests = [...this.waitingGuests, approvedGuest];
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
        this.notifiedGuests = [...this.notifiedGuests, notifiedGuest];
      }, error: () => {
        this.isLoading = false;
        alert('Unable to notify the guests');
      }
    });
  }

  seatedGuestToTable(guestid: any) {

    this.waitlistService.seatedGuest(this.restaurantId, guestid).subscribe({
      next: (res) => {
        const seatedGuest = res.data;
        this.notifiedGuests = this.notifiedGuests.filter(g => g.id !== seatedGuest.id);
        this.seatedGuests = [...this.seatedGuests, seatedGuest];
      }, error: () => {
        this.isLoading = false;
        alert('Unable to seat the guests');
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

  getInitials(name: string): string { return this.waitlistUIService.getInitials(name); }
  getAvatarColor(id: number) { return this.waitlistUIService.getAvatarColor(id); }

  trackBypendingGuest(_: number, g: PendingGuest): number { return g.id; }
  trackBywaitingGuest(_: number, g: WaitingGuest): number { return g.id; }
  trackBynotifyGuest(_: number, g: NotifiedGuest): number { return g.id; }
  trackByseatedGuest(_: number, g: SeatedGuest): number { return g.id; }


  ngOnDestroy(): void { this.sub.unsubscribe(); }



}
