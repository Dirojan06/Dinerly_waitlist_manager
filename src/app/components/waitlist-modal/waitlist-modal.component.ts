import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-modal',
  templateUrl: './waitlist-modal.component.html',
  styleUrls: ['./waitlist-modal.component.css']
})
export class WaitlistModalComponent {

  @Input() type: 'join' | 'status' = 'join';
  @Output() closeModal = new EventEmitter<void>();
  @Output() joinedWaitlist = new EventEmitter<any>();
  selectedTags: string[] = [];
  partySize = [1, 2, 3, 4, 5, '6+'];
  restaurantId = 1;
  isSubmitting = false;
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
    private fb: FormBuilder, private waitlistApi: WaitlistApiRestaurantService, private notificationService: NotificationService
  ) {
    this.waitlistForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      partySize: [null, Validators.required],
      preference: ['INDOOR', Validators.required],
      notes: [[]]
    });

    this.statusForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]
      ]
    });
  }

  selectPartySize(size: number | string): void {
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


// submit join waitlist api
  submitJoinWaitlist(): void {
    if (this.waitlistForm.invalid) {
      this.waitlistForm.markAllAsTouched();
      return;
    }
    const valueofForm = this.waitlistForm.value;

    const payload = {
      restaurantId: this.restaurantId,
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
          localStorage.setItem('waitlistRestaurantId', this.restaurantId.toString());
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
      return;
    }
    const phone = this.statusForm.get('phoneNumber')?.value;
    const payload = {
      restaurantId: this.restaurantId.toString(),
      phone: phone.trim()

    };

    this.waitlistApi.getWaitlistStatus(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response?.success) {
          if (response?.success && response?.data) {
            localStorage.setItem('waitlistGuest', JSON.stringify(response.data));
            localStorage.setItem('waitlistRestaurantId', this.restaurantId.toString());
            this.joinedWaitlist.emit(response.data);
            this.closeModal.emit();
          } else {
            alert(response?.message || 'No waitlist record found');
          }
        } else {
          alert(response?.message || 'No waitlist record found');
        }

      },
      error: () => {
        this.isSubmitting = false;
        alert('Unable to join waitlist. Please try again.');
      }
    });

  }

  close(): void {
    this.closeModal.emit();
  }
}
