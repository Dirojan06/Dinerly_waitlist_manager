import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardStatus, getDashboardData, PendingGuest, tableList, WaitingGuest } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { Guest, GuestStatus } from 'src/app/models/waitlist-restaurant.model';
import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';

@Component({
  selector: 'app-waitlist-dashboard',
  templateUrl: './waitlist-dashboard.component.html',
  styleUrls: ['./waitlist-dashboard.component.css']
})
export class WaitlistDashboardComponent implements OnInit, OnDestroy {

  stats = { waitingNow: 0, avgWait: 22, seatedToday: 34, noShows: 2 };

  pendingNotificationCount = 0;
  showNotificationBox = false;
  restaurantId = 1;
  dashboardStatus: DashboardStatus[] = [];

  dashboardData: getDashboardData = {
    averageWaitTime: 0,
    noShowsToday: 0,
    occupiedTables: 0,
    openTables: 0,
    reservedTables: 0,
    seatedToday: 0,
    tablesNeedingCleaning: 0,
    totalNotified: 0,
    totalWaiting: 0
  };
  isLoading = false;

  tables: tableList[] = [];
  tableStats = {
    total: 0,
    open: 0,
    occupied: 0,
    reserved: 0,
    cleaning: 0
  };

  currentDateTime = '';
  private clockInterval: any;

  donutStyle = '';
  private sub = new Subscription();

  constructor(
    private router: Router,
    public modalService: WaitlistRestaurantModalService, private waitlistApi: WaitlistApiRestaurantService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getRestaurantTables();
    this.loadDashboardWaitlist();
    this.loadDashboardStatus();
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

  loadDashboardStatus() {
    this.isLoading = true;


    this.waitlistApi.getDashboardData(this.restaurantId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.dashboardData = response.data;
        } else {
          alert(response.message);
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load dashboard waitlist');
      }
    });
  }



  loadDashboardWaitlist(): void {

    this.isLoading = true;


    this.waitlistApi.getDashboardStatus(this.restaurantId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.dashboardStatus = response.data || [];
        } else {
          this.dashboardStatus = [];
          alert(response.message);
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load dashboard waitlist');
      }
    });

  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'WAITING':
        return 'Waiting';
      case 'NOTIFIED':
        return 'Notified';
      case 'SEATED':
        return 'Seated';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getRestaurantTables() {

    this.waitlistApi.getRestaurantTableslist(this.restaurantId).subscribe({
      next: (res) => {
        this.tables = res.data;
        this.calculateTableStats();
      }, error: () => {
        alert('Unable to load the table');
      }
    })
  }

  calculateTableStats(): void {
    const total = this.tables.length;
    const open = this.tables.filter(t => t.status === 'OPEN').length;
    const occupied = this.tables.filter(t => t.status === 'OCCUPIED').length;
    const reserved = this.tables.filter(t => t.status === 'RESERVED').length;
    const cleaning = this.tables.filter(t => t.status === 'CLEANING').length;

    this.tableStats = {
      total,
      open,
      occupied,
      reserved,
      cleaning
    };

    if (total === 0) {
      this.donutStyle = '#e5e7eb 0 100%';
      return;
    }

    const openEnd = (open / total) * 100;
    const occupiedEnd = openEnd + (occupied / total) * 100;
    const reservedEnd = occupiedEnd + (reserved / total) * 100;
    const cleaningEnd = reservedEnd + (cleaning / total) * 100;

    this.donutStyle = `
    #22c55e 0 ${openEnd}%,
    #6d28d9 ${openEnd}% ${occupiedEnd}%,
    #f59e0b ${occupiedEnd}% ${reservedEnd}%,
    #94a3b8 ${reservedEnd}% ${cleaningEnd}%
  `;
  }

  toggleNotifications(): void {
    this.showNotificationBox = !this.showNotificationBox;
  }

  clearNotifications(): void {
    this.notificationService.clear();
    this.showNotificationBox = false;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goToWaitlist(): void {
    this.router.navigate(['/restaurant/waitlist']);
  }

  goToFloorMap(): void {
    this.router.navigate(['/restaurant/tables']);
  }



  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
