import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl: './waitlist-user-sidebar.component.html',
  styleUrls: ['./waitlist-user-sidebar.component.css']
})
export class WaitlistUserSidebarComponent {

  @Input() activeTab: 'WAITLIST' | 'MENU' | 'DISCOUNT' = 'WAITLIST';
  @Input() isLoggedGuest = false;

  @Output() tabChange = new EventEmitter<'WAITLIST' | 'MENU' | 'DISCOUNT'>();

  selectTab(tab: 'WAITLIST' | 'MENU' | 'DISCOUNT'): void {
    this.tabChange.emit(tab);
  }
}