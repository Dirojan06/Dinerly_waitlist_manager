import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {
  GuestAccount,
  GuestPortalTab
} from 'src/app/models/guest-portal.model';

import {
  Restaurant
} from 'src/app/models/waitlist-api-guest-to-restaurant.model';

import {
  WaitlistApiRestaurantService
} from 'src/app/services/waitlist-api-restaurant.service';


@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl:
    './waitlist-user-sidebar.component.html',
  styleUrls: [
    './waitlist-user-sidebar.component.css'
  ]
})
export class WaitlistUserSidebarComponent
  implements OnInit {

  @Input()
  activeTab: GuestPortalTab = 'HOME';


  @Input()
  hasWaitlistAccess = false;


  @Input()
  hasAccountAccess = false;


  @Input()
  canAccessAccountFeatures = false;


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


  restaurant?: Restaurant;

  restaurantId = 1;


  constructor(
    private waitlistApi:
      WaitlistApiRestaurantService
  ) { }


  ngOnInit(): void {

    this.restaurantId =
      Number(
        localStorage.getItem(
          'waitlistRestaurantId'
        )
      ) || 1;

    this.loadRestaurantDetails();
  }


  selectTab(
    tab: GuestPortalTab
  ): void {

    this.tabChange.emit(tab);
  }


  loginWithEmail(
  event: MouseEvent
): void {

  event.preventDefault();
  event.stopPropagation();

  console.log(
    'Sidebar login clicked'
  );

  this.accountLogin.emit();
}


  logoutAccount(event: MouseEvent): void {

    event.preventDefault();

    event.stopPropagation();

    alert('Logout button clicked');

    console.log('Logout button clicked');

    this.accountLogout.emit();

  }


  getInitial(): string {

    return (
      this.customerAccount?.name
        ?.charAt(0)
        ?.toUpperCase() ||
      'G'
    );
  }


  loadRestaurantDetails(): void {

    this.waitlistApi
      .getRestaurantDetails()
      .subscribe({
        next: res => {

          if (
            res?.success &&
            res?.data?.length
          ) {

            this.restaurant =
              res.data.find(
                item =>
                  item.id ===
                  this.restaurantId
              ) ||
              res.data[0];
          }
        },

        error: error => {

          console.error(
            'Unable to load restaurant details',
            error
          );
        }
      });
  }
}