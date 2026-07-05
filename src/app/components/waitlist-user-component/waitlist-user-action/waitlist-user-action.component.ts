import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-action',
  templateUrl: './waitlist-user-action.component.html',
  styleUrls: ['./waitlist-user-action.component.css']
})
export class WaitlistUserActionComponent {
  @Output() guestJoined = new EventEmitter<any>();
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
    this.guestJoined.emit(guest);
    this.showModal = false;

  }
}
