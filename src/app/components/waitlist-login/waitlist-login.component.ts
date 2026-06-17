import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WaitlistAuthService } from 'src/app/services/waitlist-auth.service';

export type UserRole = 'guest' | 'restaurant' | 'admin';

interface RoleConfig {
  label: string;
  icon: string;
  description: string;
  hint: string;
  accentClass: string;
}

@Component({
  selector: 'app-waitlist-login',
  templateUrl: './waitlist-login.component.html',
  styleUrls: ['./waitlist-login.component.css']
})
export class WaitlistLoginComponent implements OnInit {

  selectedRole: UserRole = 'guest';
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  toastMessage = '';
  toastVisible = false;

  roles: UserRole[] = ['guest', 'restaurant', 'admin'];

  roleConfig: Record<UserRole, RoleConfig> = {
    guest: {
      label: 'Guest',
      icon: '',
      description: 'Check your queue status & browse the menu',
      hint: 'Continue without account',
      accentClass: 'role-guest'
    },

    restaurant: {
      label: 'Restaurant',
      icon: '🍽️',
      description: 'Manage waitlist, tables & operations',
      hint: 'Use your restaurant staff account',
      accentClass: 'role-restaurant'
    },

    admin: {
      label: 'Admin',
      icon: '⚙️',
      description: 'System-wide analytics & configuration',
      hint: 'Use your admin account',
      accentClass: 'role-admin'
    }

  };

  constructor(private fb: FormBuilder, private router: Router, private auth: WaitlistAuthService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', []],
      password: ['', []]
    });
    this.updateValidatorsByRole();
  }

  get currentConfig(): RoleConfig {
    return this.roleConfig[this.selectedRole];
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.showPassword = false;
    this.loginForm.reset();
    this.updateValidatorsByRole();

  }

  private updateValidatorsByRole(): void {
    const email = this.loginForm.get('email');
    const password = this.loginForm.get('password');
    if (!email || !password) return;
    if (this.selectedRole === 'guest') {
      email.clearValidators();
      password.clearValidators();
    } else {
      email.setValidators([Validators.required, Validators.email]);
      password.setValidators([Validators.required]);
    }
    email.updateValueAndValidity();
    password.updateValueAndValidity();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.selectedRole === 'guest') {
      this.auth.loginAsGuest();
      this.showToast('Welcome Guest! Redirecting...');
      this.router.navigate(['/user']);
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: user => {
        this.isLoading = false;
        this.showToast(`Welcome ${user.fullName || user.username}`);
        this.router.navigate(['/restaurant/dashboard']);
        // else if (user.role === 'admin') {
        //   this.router.navigate(['/admin']);
        // }
      },

      error: error => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'Unable to login. Please try again.';
        }
      }
    });
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 2800);
  }

  get emailError(): string {
    if (this.selectedRole === 'guest') return '';
    const ctrl = this.loginForm.get('email');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'Email is required';
      if (ctrl.errors['email']) return 'Enter a valid email address';
    }
    return '';
  }

  get passwordError(): string {
    if (this.selectedRole === 'guest') return '';
    const ctrl = this.loginForm.get('password');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'Password is required';
      if (ctrl.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return '';
  }
}
