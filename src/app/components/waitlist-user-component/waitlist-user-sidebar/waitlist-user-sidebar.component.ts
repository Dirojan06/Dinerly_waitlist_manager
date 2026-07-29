import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { GuestAccount, GuestPortalTab } from '../waitlist-user-component.component';

@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl: './waitlist-user-sidebar.component.html',
  styleUrls: ['./waitlist-user-sidebar.component.css']
})
export class WaitlistUserSidebarComponent implements OnInit {

   @Input()

  activeTab: GuestPortalTab = 'HOME';

  @Input()

  hasWaitlistAccess = false;

  @Input()

  hasAccountAccess = false;

  @Input()

  customerAccount:

    GuestAccount | null = null;

  @Output()

  tabChange =

    new EventEmitter<GuestPortalTab>();

  @Output()

  accountLogin =

    new EventEmitter<void>();

  @Output()

  accountLogout =

    new EventEmitter<void>();

  selectTab(

    tab: GuestPortalTab

  ): void {

    this.tabChange.emit(tab);

  }

  loginWithEmail(): void {

    this.accountLogin.emit();

  }

  logoutAccount(): void {

    this.accountLogout.emit();

  }

  getInitial(): string {

    return (

      this.customerAccount?.name

        ?.charAt(0)

        ?.toUpperCase() || 'G'

    );

  }

  restaurant?: Restaurant;
  restaurantId = 1;
  constructor(private waitlistApi: WaitlistApiRestaurantService) { }

  ngOnInit(): void {
    this.restaurantId = Number(localStorage.getItem('waitlistRestaurantId')) || 1;
    this.loadRestaurantDetails();
  }
  
  loadRestaurantDetails(): void {
    this.waitlistApi.getRestaurantDetails().subscribe({
      next: (res) => {
        if (res?.success && res?.data?.length) {
          this.restaurant = res.data.find(item => item.id === this.restaurantId) || res.data[0];
        }
      },
      error: () => {
        console.log('Unable to load restaurant details');
      }
    });
  }
}