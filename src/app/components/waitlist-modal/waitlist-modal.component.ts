import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  Restaurant
} from 'src/app/models/waitlist-api-guest-to-restaurant.model';

import {
  WaitlistApiRestaurantService
} from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-modal',
  templateUrl: './waitlist-modal.component.html',
  styleUrls: ['./waitlist-modal.component.css']
})
export class WaitlistModalComponent
  implements OnInit, OnChanges, OnDestroy {

  @Input()
  type: 'join' | 'status' = 'join';

  @Input()
  restaurants: Restaurant[] = [];

  /*
   * Restaurant ID received from the QR route.
   *
   * Example:
   * /join/1
   *
   * Login component passes:
   * [initialRestaurantId]="scannedRestaurantId"
   */
  @Input()
  initialRestaurantId: number | null = null;

  /*
   * When opened from the QR code, the restaurant
   * dropdown can be locked.
   */
  @Input()
  lockRestaurantSelection = false;

  @Output()
  closeModal = new EventEmitter<void>();

  @Output()
  joinedWaitlist = new EventEmitter<any>();

  selectedRestaurantId = 0;
  restaurantId = 0;

  selectedRestaurant: Restaurant | null = null;

  selectedTags: string[] = [];

  showPartyPicker = false;
  tempPartySize = 1;

  partySize: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ];

  isSubmitting = false;
  isRestaurantLoading = false;

  partiesWaiting = 0;
  waitMinutes = 0;

  showWaitConfirmPopup = false;

  /*
   * This becomes true after the user confirms
   * that the estimated wait time is acceptable.
   */
  pendingSubmit = false;

  preference = [
    {
      label: 'No Preference',
      value: 'NO_PREFERENCE'
    },
    {
      label: 'Indoor',
      value: 'INDOOR'
    },
    {
      label: 'Outdoor',
      value: 'OUTDOOR'
    }
  ];

  notes = [
    {
      label: 'Birthday 🎂',
      value: 'BIRTHDAY'
    },
    {
      label: 'Anniversary',
      value: 'ANNIVERSARY'
    },
    {
      label: 'High chair needed',
      value: 'HIGH_CHAIR'
    },
    {
      label: 'Wheelchair access',
      value: 'WHEELCHAIR_ACCESS'
    }
  ];

  waitlistForm: FormGroup;
  statusForm: FormGroup;

  guestStatusData: any;

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private waitlistApi:
      WaitlistApiRestaurantService
  ) {
    this.waitlistForm =
      this.fb.group({
        restaurantId: [
          null,
          Validators.required
        ],

        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^\\+?[0-9]{10,15}$'
            )
          ]
        ],

        partySize: [
          1,
          Validators.required
        ],

        preference: [
          'INDOOR',
          Validators.required
        ],

        notes: ['']
      });

    this.statusForm =
      this.fb.group({
        restaurantId: [
          null,
          Validators.required
        ],

        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^\\+?[0-9]{10,15}$'
            )
          ]
        ]
      });
  }

  ngOnInit(): void {
    this.subscribeToRestaurantChanges();

    this.setInitialRestaurant();
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    /*
     * The restaurant list may arrive after
     * the modal component has already initialized.
     */
    if (
      changes['restaurants'] ||
      changes['initialRestaurantId']
    ) {
      this.setInitialRestaurant();
    }
  }

  private subscribeToRestaurantChanges(): void {
    this.waitlistForm
      .get('restaurantId')
      ?.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        restaurantId => {
          this.onRestaurantChange(
            restaurantId
          );
        }
      );

    this.statusForm
      .get('restaurantId')
      ?.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        restaurantId => {
          this.onStatusRestaurantChange(
            restaurantId
          );
        }
      );
  }

  private setInitialRestaurant(): void {
    if (
      !this.restaurants ||
      this.restaurants.length === 0
    ) {
      this.selectedRestaurant = null;
      this.selectedRestaurantId = 0;
      this.restaurantId = 0;

      return;
    }

    let restaurant:
      Restaurant | undefined;

    /*
     * First preference:
     * restaurant received from the QR route.
     */
    if (this.initialRestaurantId) {
      restaurant =
        this.restaurants.find(
          item =>
            Number(item.id) ===
            Number(
              this.initialRestaurantId
            )
        );
    }

    /*
     * Second preference:
     * restaurant already selected in the form.
     */
    if (!restaurant) {
      const currentRestaurantId =
        Number(
          this.waitlistForm
            .get('restaurantId')
            ?.value
        );

      if (currentRestaurantId) {
        restaurant =
          this.restaurants.find(
            item =>
              Number(item.id) ===
              currentRestaurantId
          );
      }
    }

    /*
     * Final fallback:
     * first restaurant in the list.
     */
    if (!restaurant) {
      restaurant =
        this.restaurants[0];
    }

    const restaurantId =
      Number(restaurant.id);

    this.selectedRestaurant =
      restaurant;

    this.selectedRestaurantId =
      restaurantId;

    this.restaurantId =
      restaurantId;

    this.waitlistForm.patchValue(
      {
        restaurantId
      },
      {
        /*
         * emitEvent true calls
         * onRestaurantChange().
         */
        emitEvent: true
      }
    );

    this.statusForm.patchValue(
      {
        restaurantId
      },
      {
        emitEvent: false
      }
    );
  }

  onRestaurantChange(
    restaurantId:
      number | string | null
  ): void {
    const selectedId =
      Number(restaurantId);

    if (
      !selectedId ||
      Number.isNaN(selectedId)
    ) {
      return;
    }

    this.selectedRestaurantId =
      selectedId;

    this.restaurantId =
      selectedId;

    this.selectedRestaurant =
      this.restaurants.find(
        restaurant =>
          Number(restaurant.id) ===
          selectedId
      ) ?? null;

    /*
     * Keep both forms on the same restaurant.
     */
    if (
      Number(
        this.statusForm
          .get('restaurantId')
          ?.value
      ) !== selectedId
    ) {
      this.statusForm.patchValue(
        {
          restaurantId: selectedId
        },
        {
          emitEvent: false
        }
      );
    }

    this.pendingSubmit = false;
    this.showWaitConfirmPopup = false;

    this.getWaitlistDashboardStatus();
  }

  onStatusRestaurantChange(
    restaurantId:
      number | string | null
  ): void {
    const selectedId =
      Number(restaurantId);

    if (
      !selectedId ||
      Number.isNaN(selectedId)
    ) {
      return;
    }

    this.selectedRestaurantId =
      selectedId;

    this.restaurantId =
      selectedId;

    this.selectedRestaurant =
      this.restaurants.find(
        restaurant =>
          Number(restaurant.id) ===
          selectedId
      ) ?? null;

    /*
     * Keep the join form restaurant synchronized.
     */
    if (
      Number(
        this.waitlistForm
          .get('restaurantId')
          ?.value
      ) !== selectedId
    ) {
      this.waitlistForm.patchValue(
        {
          restaurantId: selectedId
        },
        {
          emitEvent: false
        }
      );
    }

    this.getWaitlistDashboardStatus();
  }

  getWaitlistDashboardStatus(): void {
    if (!this.restaurantId) {
      this.partiesWaiting = 0;
      this.waitMinutes = 0;

      return;
    }

    this.waitlistApi
      .getwaitlistdashBoardStatus(
        this.restaurantId
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (
            res?.success &&
            res?.data
          ) {
            this.partiesWaiting =
              Number(
                res.data.totalWaiting
              ) || 0;

            this.waitMinutes =
              Number(
                res.data.averageWaitTime
              ) || 0;
          } else {
            this.partiesWaiting = 0;
            this.waitMinutes = 0;
          }
        },

        error: (error) => {
          console.error(
            'Waitlist dashboard status error:',
            error
          );

          this.partiesWaiting = 0;
          this.waitMinutes = 0;
        }
      });
  }

  confirmWaitAndJoin(): void {
    this.showWaitConfirmPopup = false;
    this.pendingSubmit = true;

    /*
     * Continue the submit after the user
     * confirms the estimated wait.
     */
    this.submitJoinWaitlist();
  }

  cancelWaitConfirm(): void {
    this.showWaitConfirmPopup = false;
    this.pendingSubmit = false;
  }

  selectPartySize(
    size: number
  ): void {
    this.waitlistForm.patchValue({
      partySize: size
    });
  }

  toggleTag(
    tag: string
  ): void {
    const selectedNotes = [
      ...this.selectedTags
    ];

    const index =
      selectedNotes.indexOf(tag);

    if (index > -1) {
      selectedNotes.splice(
        index,
        1
      );
    } else {
      selectedNotes.push(tag);
    }

    this.selectedTags =
      selectedNotes;

    this.waitlistForm.patchValue({
      notes:
        selectedNotes.join(', ')
    });
  }

  isSelectedTag(
    tag: string
  ): boolean {
    return this.selectedTags.includes(
      tag
    );
  }

  openPartyPicker(): void {
    this.tempPartySize =
      Number(
        this.waitlistForm
          .get('partySize')
          ?.value || 1
      );

    this.showPartyPicker = true;
  }

  closePartyPicker(): void {
    this.showPartyPicker = false;
  }

  confirmPartyPicker(): void {
    this.waitlistForm.patchValue({
      partySize:
        this.tempPartySize
    });

    this.showPartyPicker = false;
  }

  submitJoinWaitlist(): void {
    if (this.waitlistForm.invalid) {
      this.waitlistForm
        .markAllAsTouched();

      return;
    }

    if (
      this.partiesWaiting > 0 &&
      !this.pendingSubmit
    ) {
      this.showWaitConfirmPopup =
        true;

      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue =
      this.waitlistForm
        .getRawValue();

    const restaurantId =
      Number(
        formValue.restaurantId
      );

    const payload = {
      restaurantId,

      name:
        String(
          formValue.name || ''
        ).trim(),

      phone:
        String(
          formValue.phone || ''
        ).trim(),

      partySize:
        Number(
          formValue.partySize
        ),

      preference:
        formValue.preference,

      /*
       * The current HTML contains a normal
       * notes input, so use the form value.
       *
       * If tag buttons are used, the tag values
       * are also included.
       */
      notes:
        this.buildNotesValue(
          formValue.notes
        )
    };

    this.waitlistApi
      .joinWaitlist(payload)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          this.isSubmitting =
            false;

          this.pendingSubmit =
            false;

          if (
            res?.success &&
            res?.data
          ) {
            localStorage.setItem(
              'waitlistGuest',
              JSON.stringify(
                res.data
              )
            );

            localStorage.setItem(
              'waitlistRestaurantId',
              String(
                restaurantId
              )
            );

            this.joinedWaitlist.emit(
              res.data
            );

            this.closeModal.emit();
          } else {
            alert(
              res?.message ||
              'Unable to join waitlist'
            );
          }
        },

        error: (error) => {
          this.isSubmitting =
            false;

          this.pendingSubmit =
            false;

          console.error(
            'Join waitlist error:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to join waitlist. Please try again.'
          );
        }
      });
  }

  private buildNotesValue(
    typedNotes: unknown
  ): string {
    const manualNotes =
      String(
        typedNotes || ''
      ).trim();

    const tagNotes =
      this.selectedTags.join(', ');

    if (
      manualNotes &&
      tagNotes
    ) {
      return `${tagNotes}, ${manualNotes}`;
    }

    return (
      manualNotes ||
      tagNotes ||
      ''
    );
  }

  checkStatus(): void {
    if (this.statusForm.invalid) {
      this.statusForm
        .markAllAsTouched();

      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const formValue =
      this.statusForm
        .getRawValue();

    const restaurantId =
      Number(
        formValue.restaurantId
      );

    if (!restaurantId) {
      alert(
        'Please select a restaurant.'
      );

      return;
    }

    const phone =
      String(
        formValue.phoneNumber || ''
      ).trim();

    const payload = {
      restaurantId,
      phone
    };

    this.isSubmitting = true;

    this.waitlistApi
      .getWaitlistStatus(payload)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.isSubmitting =
            false;

          if (
            response?.success &&
            response?.data
          ) {
            localStorage.setItem(
              'waitlistGuest',
              JSON.stringify(
                response.data
              )
            );

            localStorage.setItem(
              'waitlistRestaurantId',
              String(
                restaurantId
              )
            );

            this.joinedWaitlist.emit(
              response.data
            );

            this.closeModal.emit();
          } else {
            alert(
              response?.message ||
              'No waitlist record found'
            );
          }
        },

        error: (error) => {
          this.isSubmitting =
            false;

          console.error(
            'Check waitlist status error:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to check waitlist status. Please try again.'
          );
        }
      });
  }

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showPartyPicker = false;
    this.showWaitConfirmPopup = false;
    this.pendingSubmit = false;

    this.closeModal.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}