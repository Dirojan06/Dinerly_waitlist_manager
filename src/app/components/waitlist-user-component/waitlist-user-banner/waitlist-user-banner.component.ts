import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-banner',
  templateUrl: './waitlist-user-banner.component.html',
  styleUrls: ['./waitlist-user-banner.component.css']
})
export class WaitlistUserBannerComponent {

  @Output() joinedWaitlist = new EventEmitter<any>();
  showModal = false;

  modalType: 'join' | 'status' = 'join';

  openModal(type: 'join' | 'status'): void {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onJoinedWaitlist(guest: any): void {
    this.joinedWaitlist.emit(guest);
    this.showModal = false;
  }
}
