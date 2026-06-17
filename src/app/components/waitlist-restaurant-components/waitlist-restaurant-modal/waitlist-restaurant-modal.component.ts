import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WaitingGuest } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { SeatingPreference, SpecialTag } from 'src/app/models/waitlist-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';

@Component({
  selector: 'app-waitlist-restaurant-modal',
  templateUrl: './waitlist-restaurant-modal.component.html',
  styleUrls: ['./waitlist-restaurant-modal.component.css']
})
export class WaitlistRestaurantModalComponent {
  restaurantId = 1;
visible = false;
  form: FormGroup;
  isLoading = false;
  selectedDate = '';
  waitingGuests: WaitingGuest[] = [];
  waitTimeOptions = [5, 10, 15, 20, 25, 30];
  selectedWaitTime = 5;
  position = 0;
  private sub = new Subscription();

  readonly preferences: SeatingPreference[] = ['No preference', 'Indoor', 'Outdoor', 'Patio preferred', 'Bar seating OK', 'Quiet section'];

  constructor(
    private fb: FormBuilder,
    private waitlistService: WaitlistApiRestaurantService,
    public modalService: WaitlistRestaurantModalService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      partySize: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
      preference: ['No preference'],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.sub.add(this.modalService.visible$.subscribe(v => { console.log('Modal visible:', v), this.visible = v }));
    this.loadWaitingGuests();
  }

  // Load waiting guests for the restaurant
  loadWaitingGuests(): void {
    this.isLoading = true;
     let selectedStatus = "WAITING"
    this.waitlistService.getWaitingGuests(this.restaurantId, selectedStatus, this.selectedDate).subscribe({
      next: (response) => {

        this.waitingGuests = response.data || [];
        this.position = this.waitingGuests.length + 1;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load waiting guests');
        this.waitingGuests.length = 0;
      }
    }); 
  }
  ngOnDestroy(): void { this.sub.unsubscribe(); }

  

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.position = this.waitingGuests.length + 1;

    this.waitlistService.addGuestInWaitlist(this.restaurantId, {
      name: v.name.trim(),
      phone: v.phone.trim(),
      partySize: +v.partySize,
      preference: v.preference as SeatingPreference,
      notes: v.notes.trim(),
      position: this.position,
      estimatedWaitTime: this.selectedWaitTime
    }).subscribe({
      next: (res) => {
        this.reset();
        this.modalService.close();
      }, error: () => {
        this.isLoading = false;
        alert('Unable to create a table for the guests');

      }
    });
    
  }

  close(): void {
    this.reset();
    this.modalService.close();
  }

  private reset(): void {
    this.form.reset({ partySize: 2, preference: 'No preference' });
    
  }
}
