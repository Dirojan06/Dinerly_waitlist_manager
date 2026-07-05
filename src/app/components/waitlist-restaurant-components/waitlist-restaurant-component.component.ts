import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { DashboardStatus, tableList } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-restaurant-component',
  templateUrl: './waitlist-restaurant-component.component.html',
  styleUrls: ['./waitlist-restaurant-component.component.css']
})
export class WaitlistRestaurantComponentComponent implements OnInit, OnDestroy {

  activeRoute = 'waitlist';
  guestCount = 0;
  notifyCount = 0;
  openTablesCount = 0;
  showModal = false;
  restaurantId = 1;
  tables: tableList[] = [];
  private subs = new Subscription();
  isLoading: boolean = false;
  dashboardStatus: DashboardStatus[] = [];

  private refreshSub?: Subscription;
  constructor(private router: Router, private waitlistService: WaitlistApiRestaurantService,private notificationService : NotificationService) { }

  ngOnInit(): void {

    this.setActiveRouteFromUrl(this.router.url);
    this.subs.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.setActiveRouteFromUrl(event.urlAfterRedirects);
        })
    );

    this.getRestaurantTables();
    this.loadDashboardWaitlist();
    
    this.refreshSub = this.notificationService.restaurantRefresh$.subscribe(() => {
    this.getRestaurantTables();
    this.loadDashboardWaitlist();
  });

  }

  getRestaurantTables() {

    this.waitlistService.getRestaurantTableslist(this.restaurantId).subscribe({
      next: (res) => {
        this.tables = res.data;
        this.openTablesCount = this.tables.filter(

          (table: any) => table.status === 'OPEN'

        ).length;
      }, error: () => {
        alert('Unable to load the table');
      }
    })
  }

  loadDashboardWaitlist(): void {

    this.isLoading = true;


    this.waitlistService.getDashboardStatus(this.restaurantId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.guestCount = response.data.filter(

        (guest: any) =>

          guest.status === 'PENDING' ||

          guest.status === 'WAITING' ||

          guest.status === 'NOTIFIED'

      ).length;
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load dashboard waitlist');
      }
    });

  }

  setActiveRouteFromUrl(url: string): void {
    const segments = url.split('/').filter(Boolean);
    this.activeRoute = segments[segments.length - 1] || 'waitlist';
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); this.refreshSub?.unsubscribe(); }

  navigate(route: string): void {
    this.activeRoute = route;
    this.router.navigate(['/restaurant', route]);
  }

  get capacityPercent(): number { return Math.round((43 / 60) * 100); }
}