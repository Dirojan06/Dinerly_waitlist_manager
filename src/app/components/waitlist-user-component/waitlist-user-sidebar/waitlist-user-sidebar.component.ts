import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-user-sidebar',
  templateUrl: './waitlist-user-sidebar.component.html',
  styleUrls: ['./waitlist-user-sidebar.component.css']
})
export class WaitlistUserSidebarComponent implements OnInit {

  @Input() activeTab: 'WAITLIST' | 'MENU' | 'DISCOUNT' = 'WAITLIST';
  @Input() isLoggedGuest = false;
  @Output() tabChange = new EventEmitter<'WAITLIST' | 'MENU' | 'DISCOUNT'>();
  restaurant?: Restaurant;
  restaurantId = 1;

  selectTab(tab: 'WAITLIST' | 'MENU' | 'DISCOUNT'): void {
    this.tabChange.emit(tab);
  }
  constructor(private waitlistApi: WaitlistApiRestaurantService) { }

  ngOnInit(): void {
    this.restaurantId = Number(localStorage.getItem('waitlistRestaurantId')) ;
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