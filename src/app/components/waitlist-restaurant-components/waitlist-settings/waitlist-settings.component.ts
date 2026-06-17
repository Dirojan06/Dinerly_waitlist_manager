import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-waitlist-settings',
  templateUrl: './waitlist-settings.component.html',
  styleUrls: ['./waitlist-settings.component.css']
})
export class WaitlistSettingsComponent {
restaurantForm: FormGroup;
  notificationForm: FormGroup;
  saved = false;

  constructor(private fb: FormBuilder) {
    this.restaurantForm = this.fb.group({
      name: ['Dinerly', Validators.required],
      capacity: [60, [Validators.required, Validators.min(1)]],
      openTime: ['5:00 PM', Validators.required],
      closeTime: ['11:00 PM', Validators.required],
    });
    this.notificationForm = this.fb.group({
      reminderWindow: [10, [Validators.required, Validators.min(1)]],
      enableSms: [true],
      autoNotify: [false],
    });
  }

  saveRestaurant(): void {
    if (this.restaurantForm.valid) {
      alert('Restaurant settings saved!');
    }
  }

  saveNotifications(): void {
    if (this.notificationForm.valid) {
      alert('Notification settings saved!');
    }
  }
}
