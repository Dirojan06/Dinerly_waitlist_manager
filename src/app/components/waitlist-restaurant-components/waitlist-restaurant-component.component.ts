import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-waitlist-restaurant-component',
  templateUrl: './waitlist-restaurant-component.component.html',
  styleUrls: ['./waitlist-restaurant-component.component.css']
})
export class WaitlistRestaurantComponentComponent implements OnInit, OnDestroy {

  activeRoute = 'dashboard';
  guestCount = 0;
  notifyCount = 0;
  openTablesCount = 0;
  showModal = false;
  private subs = new Subscription();

  constructor(private router: Router) { }

  ngOnInit(): void {

    this.setActiveRouteFromUrl(this.router.url);
    this.subs.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.setActiveRouteFromUrl(event.urlAfterRedirects);
        })
    );
  }

  setActiveRouteFromUrl(url: string): void {
    const segments = url.split('/').filter(Boolean);
    this.activeRoute = segments[segments.length - 1] || 'dashboard';
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  navigate(route: string): void {
    this.activeRoute = route;
    this.router.navigate(['/restaurant', route]);
  }

  get capacityPercent(): number { return Math.round((43 / 60) * 100); }
}