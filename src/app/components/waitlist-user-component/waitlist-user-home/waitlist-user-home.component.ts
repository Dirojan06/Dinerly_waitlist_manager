import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {
  GuestAccount,
  GuestPortalTab,
  PortalOffer,
  PortalRestaurant
} from 'src/app/models/guest-portal.model';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-waitlist-user-home',
  templateUrl: './waitlist-user-home.component.html',
  styleUrls: ['./waitlist-user-home.component.css']
})
export class WaitlistUserHomeComponent implements OnInit{

  @Input()
  waitlistGuest: any = null;

  @Input()
  customerAccount: GuestAccount | null = null;

  @Input()
  hasWaitlistAccess = false;

  @Input()
  hasAccountAccess = false;

  @Input()
  cancelledGuest: any = null;

  @Input()
  restoreRequestSent = false;

  @Output()
  tabChange =
    new EventEmitter<GuestPortalTab>();

  @Output()
  accountLogin =
    new EventEmitter<void>();

  @Output()
  guestJoined =
    new EventEmitter<any>();

  @Output()
  restoreRequested =
    new EventEmitter<any>();

  selectedCategory = 'All';

  categories: string[] = [
    'All',
    'Open now',
    'No wait',
    'Breakfast',
    'Italian',
    'Steakhouse',
    'Brunch',
    'Sushi',
    'Vegetarian'
  ];

  nearbyRestaurants: PortalRestaurant[] = [
    {
      id: 1,
      name: 'Brothers Café',
      cuisine: 'Breakfast · Diner',
      distance: '0.4 km',
      rating: 4.8,
      reviewCount: 622,
      waitTime: 12,
      partiesAhead: 3,
      tableStatus: 'Family friendly',
      imageClass: 'restaurant-purple',
      status: 'OPEN'
    },
    {
      id: 2,
      name: 'Trattoria Nove',
      cuisine: 'Italian · Pasta',
      distance: '1.1 km',
      rating: 4.6,
      reviewCount: 428,
      waitTime: 5,
      partiesAhead: 0,
      tableStatus: 'Tables open',
      imageClass: 'restaurant-gold',
      status: 'NO_WAIT'
    },
    {
      id: 3,
      name: 'The Copper Grill',
      cuisine: 'Steakhouse',
      distance: '2.3 km',
      rating: 4.9,
      reviewCount: 927,
      waitTime: 18,
      partiesAhead: 11,
      tableStatus: 'Patio available',
      imageClass: 'restaurant-blue',
      status: 'BUSY'
    },
    {
      id: 4,
      name: 'Maple & Ash',
      cuisine: 'Canadian · Comfort',
      distance: '1.6 km',
      rating: 4.4,
      reviewCount: 211,
      waitTime: 0,
      partiesAhead: 0,
      tableStatus: 'Vegetarian options',
      imageClass: 'restaurant-green',
      status: 'NO_WAIT'
    }
  ];

  recentRestaurants: PortalRestaurant[] = [
    {
      id: 5,
      name: 'Bluebird Kitchen',
      cuisine: 'Brunch · Café',
      distance: '0.9 km',
      rating: 4.8,
      reviewCount: 289,
      waitTime: 15,
      partiesAhead: 2,
      tableStatus: 'Rewards eligible',
      imageClass: 'restaurant-gold',
      status: 'OPEN'
    },
    {
      id: 6,
      name: 'Stacked Pancake House',
      cuisine: 'Breakfast · Diner',
      distance: '1.3 km',
      rating: 4.8,
      reviewCount: 518,
      waitTime: 0,
      partiesAhead: 0,
      tableStatus: 'Family friendly',
      imageClass: 'restaurant-pink',
      status: 'NO_WAIT'
    }
  ];

  homeOffers: PortalOffer[] = [
    {
      id: 1,
      restaurantName: 'Trattoria Nove',
      title: '20% off pasta night',
      description: 'Available on selected pasta dishes.',
      discountText: '20% OFF',
      validUntil: 'Jul 31',
      imageClass: 'offer-gold'
    },
    {
      id: 2,
      restaurantName: 'Brothers Café',
      title: '$10 off your first visit',
      description: 'For new Dinerly members.',
      discountText: '$10 OFF',
      validUntil: 'Aug 10',
      imageClass: 'offer-purple'
    }
  ];

  constructor(private menuService: MenuService){

  }

  ngOnInit(): void {
    
  }

  openTab(tab: GuestPortalTab): void {
    this.tabChange.emit(tab);
  }

  loginWithEmail(): void {
    this.accountLogin.emit();
  }

  onGuestJoined(guest: any): void {
    this.guestJoined.emit(guest);
  }

  onRestoreRequested(guest: any): void {
    this.restoreRequested.emit(guest);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  joinRestaurantWaitlist(
    restaurant: PortalRestaurant
  ): void {
    console.log(
      'Join waitlist:',
      restaurant
    );

    this.openTab('WAITLIST');
  }
}