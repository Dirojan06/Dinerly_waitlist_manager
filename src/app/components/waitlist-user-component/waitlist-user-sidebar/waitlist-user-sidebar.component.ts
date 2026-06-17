import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl: './waitlist-user-sidebar.component.html',
  styleUrls: ['./waitlist-user-sidebar.component.css']
})
export class WaitlistUserSidebarComponent {

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
