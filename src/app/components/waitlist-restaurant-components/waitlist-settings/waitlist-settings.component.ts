import { Component } from '@angular/core';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  onFloor: boolean;
}

@Component({
  selector: 'app-waitlist-settings',
  templateUrl: './waitlist-settings.component.html',
  styleUrls: ['./waitlist-settings.component.css']
})
export class WaitlistSettingsComponent {

  restaurant = {
    name: 'Brothers Café',
    address: '123 Market St, Winnipeg',
    hours: '11:00 AM – 10:00 PM',
    phone: '(204) 555-0142'
  };

  staffName = '';
  staffRole = 'Server';
  staffRoles = ['Server', 'Host', 'Bartender', 'Busser', 'Manager'];
  staffList: StaffMember[] = [
    {
      id: 1,
      name: 'hari',
      role: 'Server',
      onFloor: true
    }

  ];

  notifications = {
    textReady: true,
    nightlySummary: true,
    autoRemoveNoShows: false
  };

  floorOverview = {
    sections: 2,
    totalTables: 25,
    totalSeats: 110
  };

  guestJoinLink = 'dinerly.app/join/brothers-cafe';

  addStaff() {
    if (!this.staffName.trim()) return;
    this.staffList.push({
      id: Date.now(),
      name: this.staffName.trim(),
      role: this.staffRole,
      onFloor: false
    });
    this.staffName = '';
    this.staffRole = 'Server';
  }

  removeStaff(id: number) {
    this.staffList = this.staffList.filter(staff => staff.id !== id);
  }

  toggleFloor(staff: StaffMember) {
    staff.onFloor = !staff.onFloor;
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  copyLink() {
    navigator.clipboard.writeText(this.guestJoinLink);
  }

  downloadQrCode() {
    alert('QR download logic can be connected later');
  }

  editProfile() {
    alert('Open edit profile modal here');
  }

  get staffOnFile(): number {
    return this.staffList.length;
  }

  get currentTimeOnly(): string {
    return new Date().toLocaleTimeString('en-IN', {
      timeZone: 'America/Toronto',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
