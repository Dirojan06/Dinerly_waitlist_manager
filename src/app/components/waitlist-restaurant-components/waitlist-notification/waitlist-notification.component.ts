import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

interface NotificationGuest {
  id: number;
  name: string;
  phone: string;
  partySize: number;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED';
  waitMinutes: number;
  addedAt: string;
}

@Component({
  selector: 'app-waitlist-notification',
  templateUrl: './waitlist-notification.component.html',
  styleUrls: ['./waitlist-notification.component.css']
})
export class WaitlistNotificationComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  searchText = '';
  selectedStatus = 'ALL';
  smsMessage = '';
  currentPage = 1;

  pageSize = 10;

  selectedGuest: NotificationGuest | null = null;

  guests: NotificationGuest[] = [
    { id: 1, name: 'Rahul Mehta', phone: '9876543210', partySize: 4, status: 'WAITING', waitMinutes: 25, addedAt: '12:30 PM' },
    { id: 2, name: 'Priya Sharma', phone: '9876543211', partySize: 2, status: 'NOTIFIED', waitMinutes: 18, addedAt: '12:37 PM' },
    { id: 3, name: 'Amit Verma', phone: '9876543212', partySize: 6, status: 'WAITING', waitMinutes: 32, addedAt: '12:23 PM' },
    { id: 4, name: 'Sneha Iyer', phone: '9876543213', partySize: 3, status: 'SEATED', waitMinutes: 0, addedAt: '12:10 PM' },
    { id: 5, name: 'Pankaj Gupta', phone: '9876543214', partySize: 2, status: 'NOTIFIED', waitMinutes: 12, addedAt: '12:42 PM' },
    { id: 6, name: 'Neha Singh', phone: '9876543215', partySize: 5, status: 'WAITING', waitMinutes: 40, addedAt: '12:15 PM' },
    { id: 7, name: 'Karan Patel', phone: '9876543216', partySize: 4, status: 'NOTIFIED', waitMinutes: 10, addedAt: '12:45 PM' },
    { id: 8, name: 'Anjali Desai', phone: '9876543217', partySize: 2, status: 'WAITING', waitMinutes: 15, addedAt: '12:40 PM' },
    { id: 9, name: 'Vikram Joshi', phone: '9876543218', partySize: 8, status: 'SEATED', waitMinutes: 0, addedAt: '12:05 PM' },
    { id: 10, name: 'Meera Kapoor', phone: '9876543219', partySize: 3, status: 'NOTIFIED', waitMinutes: 8, addedAt: '12:47 PM' },
    { id: 11, name: 'Meera Kapoor', phone: '9876543219', partySize: 3, status: 'NOTIFIED', waitMinutes: 8, addedAt: '12:47 PM' },
    { id: 12, name: 'Meera Kapoor', phone: '9876543219', partySize: 3, status: 'NOTIFIED', waitMinutes: 8, addedAt: '12:47 PM' }

  ];

  templates = [
    {
      title: 'Welcome Message',
      message: 'Hi {name}, your table will be ready soon. Thank you!'
    },
    {
      title: 'Your Turn Soon',
      message: 'Hi {name}, your turn is coming soon. Please be nearby.'
    },
    {
      title: 'Table Ready',
      message: 'Hi {name}, your table is ready. Please check-in.'
    },
    {
      title: 'Thank You',
      message: 'Hi {name}, thank you for waiting with us today!'
    }
  ];

  ngOnInit(): void {
    this.selectedGuest = this.guests[0];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get stats() {
    return {
      total: this.guests.length,
      waiting: this.guests.filter(g => g.status === 'WAITING').length,
      notified: this.guests.filter(g => g.status === 'NOTIFIED').length,
      seated: this.guests.filter(g => g.status === 'SEATED').length,
      cancelled: this.guests.filter(g => g.status === 'CANCELLED').length
    };
  }

  get filteredGuests(): NotificationGuest[] {
    const search = this.searchText.toLowerCase().trim();

    return this.guests.filter(guest => {
      const matchesSearch =
        guest.name.toLowerCase().includes(search) ||
        guest.phone.includes(search);

      const matchesStatus =
        this.selectedStatus === 'ALL' ||
        guest.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  selectGuest(guest: NotificationGuest): void {
    this.selectedGuest = guest;
    this.smsMessage = '';
  }

  sendSms(): void {
    if (!this.selectedGuest) return;

    if (!this.smsMessage.trim()) {
      alert('Please enter SMS message');
      return;
    }

    alert(`SMS sent to ${this.selectedGuest.name}`);
  }

  trackByGuest(_: number, guest: NotificationGuest): number {
    return guest.id;
  }
  get totalPages(): number {
    return Math.ceil(this.filteredGuests.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startItem(): number {
    return this.filteredGuests.length === 0  ? 0  : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredGuests.length);
  }

  get paginatedGuests(): NotificationGuest[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredGuests.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}