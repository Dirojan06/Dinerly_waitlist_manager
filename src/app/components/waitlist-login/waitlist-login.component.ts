import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistAuthService } from 'src/app/services/waitlist-auth.service';

export type UserRole = 'restaurant' | 'admin';

@Component({
  selector: 'app-waitlist-login',
  templateUrl: './waitlist-login.component.html',
  styleUrls: ['./waitlist-login.component.css']
})
export class WaitlistLoginComponent implements OnInit {

  selectedRole: UserRole = 'restaurant';

  loginForm!: FormGroup;

  isLoading = false;
  showPassword = false;
  errorMessage = '';
  isDarkMode = false;
  isAdminLogin = true;
  showModal = false;
  modalType: 'join' | 'status' = 'join';
  restaurants: Restaurant[] = [];
  isRestaurantLoaded = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: WaitlistAuthService,
    private waitlistApi: WaitlistApiRestaurantService
  ) { }

  ngOnInit(): void {
    this.router.navigate(['/login/restaurant']);
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.route.paramMap.subscribe(params => {
      const role = params.get('role');

      this.selectedRole = role === 'admin' ? 'admin' : 'restaurant';

      this.loginForm.reset();
      this.errorMessage = '';
    });

    const savedTheme = localStorage.getItem('dinerly-theme');
    this.isDarkMode = savedTheme === 'dark';

    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.loadRestaurants();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem(
      'dinerly-theme',
      this.isDarkMode ? 'dark' : 'light'
    );

    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
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
    localStorage.setItem('waitlistGuest', JSON.stringify(guest));
    this.showModal = false;
    this.router.navigate(['/user']);
  }
  goToLogin(): void {
    if (this.isAdminLogin) {
      this.router.navigate(['/login/admin']);
      this.isAdminLogin = false;
    } else {
      this.router.navigate(['/login/restaurant']);
      this.isAdminLogin = true;
    }
  }


  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;

        if (this.selectedRole === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/restaurant/waitlist']);
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'Unable to login. Please try again.';
        }
      }
    });
  }

  get emailError(): string {
    const ctrl = this.loginForm.get('email');

    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'Email is required';
      if (ctrl.errors['email']) return 'Enter a valid email address';
    }

    return '';
  }

  get passwordError(): string {
    const ctrl = this.loginForm.get('password');

    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'Password is required';
    }

    return '';
  }
}