import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';


@Component({
  selector: 'app-waitlist-modal',
  templateUrl: './waitlist-modal.component.html',
  styleUrls: ['./waitlist-modal.component.css']
})
export class WaitlistModalComponent implements OnInit {

  @Input() type: 'join' | 'status' = 'join';
  @Output() closeModal = new EventEmitter<void>();
  @Output() joinedWaitlist = new EventEmitter<any>();

  @Input() restaurants: Restaurant[] = [];
  selectedRestaurantId = 1;
  restaurantId = 1;

  selectedTags: string[] = [];
  showPartyPicker = false;
  tempPartySize = 1;
  partySize: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  isSubmitting = false;
  isRestaurantLoading = false;

  partiesWaiting = 0;
  waitMinutes = 0;

  showWaitConfirmPopup = false;
  pendingSubmit = false;

  preference = [
    { label: 'No Preference', value: 'NO_PREFERENCE' },
    { label: 'Indoor', value: 'INDOOR' },
    { label: 'Patio', value: 'PATIO' },
    { label: 'Bar Seating', value: 'BAR_SEATING' },
    { label: 'Booth', value: 'BOOTH' }
  ];

  notes = [
    { label: 'Birthday 🎂', value: 'BIRTHDAY' },
    { label: 'Anniversary', value: 'ANNIVERSARY' },
    { label: 'High chair needed', value: 'HIGH_CHAIR' },
    { label: 'Wheelchair access', value: 'WHEELCHAIR_ACCESS' }
  ];

  waitlistForm: FormGroup;
  statusForm: FormGroup;
  guestStatusData: any;

  constructor(
    private fb: FormBuilder,
    private waitlistApi: WaitlistApiRestaurantService
  ) {
    this.waitlistForm = this.fb.group({
      restaurantId: [1, Validators.required],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      partySize: [1, Validators.required],
      preference: ['INDOOR', Validators.required],
      notes: ['']
    });

    this.statusForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]]
    });
  }

  ngOnInit(): void {
    this.waitlistForm.get('restaurantId')?.valueChanges.subscribe((value) => {
      this.onRestaurantChange(value);
    });

    if (this.restaurants.length) {
      const firstRestaurant = this.restaurants[0];

      this.selectedRestaurantId = firstRestaurant.id;
      this.restaurantId = firstRestaurant.id;

      this.waitlistForm.patchValue(
        {
          restaurantId: firstRestaurant.id
        },
        {
          emitEvent: true
        }
      );
    }

    this.getWaitlistDashboardStatus();
  }

  onRestaurantChange(event: Event): void {
    const selectedId = Number((event.target as HTMLSelectElement).value);

    this.selectedRestaurantId = selectedId;
    this.restaurantId = selectedId;

    console.log('Selected restaurant:', this.restaurantId);

    this.getWaitlistDashboardStatus();
  }

  getWaitlistDashboardStatus(): void {
    this.waitlistApi.getwaitlistdashBoardStatus(this.restaurantId).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.partiesWaiting = res.data.totalWaiting || 0;
          this.waitMinutes = res.data.averageWaitTime || 0;
          if (this.partiesWaiting > 0 && !this.pendingSubmit) {

            this.showWaitConfirmPopup = true;

            return;

          }
        } else {
          this.partiesWaiting = 0;
          this.waitMinutes = 0;
        }
      },
      error: () => {
        this.partiesWaiting = 0;
        this.waitMinutes = 0;
      }
    });
  }

  confirmWaitAndJoin(): void {
    this.showWaitConfirmPopup = false;
    this.pendingSubmit = true;
  }

  cancelWaitConfirm(): void {
    this.showWaitConfirmPopup = false;
    this.pendingSubmit = false;
  }

  selectPartySize(size: number): void {
    this.waitlistForm.patchValue({
      partySize: size
    });
  }

  toggleTag(tag: string): void {
    const notes = [...this.selectedTags];
    const index = notes.indexOf(tag);

    if (index > -1) {
      notes.splice(index, 1);
    } else {
      notes.push(tag);
    }

    this.selectedTags = notes;

    this.waitlistForm.patchValue({
      notes: notes.join(', ')
    });
  }

  isSelectedTag(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  openPartyPicker(): void {
    this.tempPartySize = Number(this.waitlistForm.get('partySize')?.value || 1);
    this.showPartyPicker = true;
  }

  closePartyPicker(): void {
    this.showPartyPicker = false;
  }

  confirmPartyPicker(): void {
    this.waitlistForm.patchValue({
      partySize: this.tempPartySize
    });

    this.showPartyPicker = false;
  }

  submitJoinWaitlist(): void {
    if (this.waitlistForm.invalid) {
      this.waitlistForm.markAllAsTouched();
      return;
    }

    if (this.partiesWaiting > 0 && !this.pendingSubmit) {

      this.showWaitConfirmPopup = true;

      return;

    }

    this.isSubmitting = true;

    const valueofForm = this.waitlistForm.value;

    const payload = {
      restaurantId: +valueofForm.restaurantId,
      name: valueofForm.name.trim(),
      phone: valueofForm.phone.trim(),
      partySize: +valueofForm.partySize,
      preference: valueofForm.preference,
      notes: this.selectedTags.join(', ')
    };

    this.waitlistApi.joinWaitlist(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res?.success && res?.data) {
          localStorage.setItem('waitlistGuest', JSON.stringify(res.data));
          localStorage.setItem('waitlistRestaurantId', valueofForm.restaurantId);

          this.joinedWaitlist.emit(res.data);
          this.closeModal.emit();
        } else {
          alert(res?.message || 'Unable to join waitlist');
        }
      },
      error: () => {
        this.isSubmitting = false;
        alert('Unable to join waitlist. Please try again.');
      }
    });
  }

  checkStatus(): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const phone = this.statusForm.get('phoneNumber')?.value;

    const payload = {
      restaurantId: this.restaurantId,
      phone: phone.trim()
    };

    this.waitlistApi.getWaitlistStatus(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response?.success && response?.data) {
          localStorage.setItem('waitlistGuest', JSON.stringify(response.data));
          localStorage.setItem('waitlistRestaurantId', this.restaurantId.toString());

          this.joinedWaitlist.emit(response.data);
          this.closeModal.emit();
        } else {
          alert(response?.message || 'No waitlist record found');
        }
      },
      error: () => {
        this.isSubmitting = false;
        alert('Unable to check waitlist status. Please try again.');
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}