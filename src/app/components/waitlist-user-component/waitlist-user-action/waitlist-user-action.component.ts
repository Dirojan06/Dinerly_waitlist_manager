import { Component, EventEmitter, Output } from '@angular/core';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-user-action',
  templateUrl: './waitlist-user-action.component.html',
  styleUrls: ['./waitlist-user-action.component.css']
})
export class WaitlistUserActionComponent {
  @Output() guestJoined = new EventEmitter<any>();
  showModal = false;
  modalType: 'join' | 'status' = 'join';
  restaurants: Restaurant[] = [];
    isRestaurantLoaded = false;

constructor(
    private waitlistApi: WaitlistApiRestaurantService) { }

    ngOnInit(): void {
    this.loadRestaurants();
    }

    loadRestaurants(): void {
    this.waitlistApi.getRestaurantDetails().subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          this.restaurants = res.data;
          this.isRestaurantLoaded = true;
        }
      },

      error: () => {
        this.isRestaurantLoaded = false;
      }
    });
  }

  openModal(type: 'join' | 'status'): void {
    if (!this.isRestaurantLoaded) {

      alert('Restaurants are still loading. Please try again.');

      return;

    }
    this.modalType = type;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onJoinedWaitlist(guest: any): void {
    this.guestJoined.emit(guest);
    this.showModal = false;

  }
}
