import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthUser, LoginResponse } from '../models/waitlist-auth.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WaitlistAuthService {

  private readonly baseUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'waitlist_token';
  private readonly USER_KEY = 'waitlist_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        const token = response.data.token;
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY,JSON.stringify(response.data.user));
        this.currentUserSubject.next(response.data.user);
      }),
      map(response => response.data.user)
    );
  }

  loginAsGuest(): void {
    const guestUser: AuthUser = {
      id: 'guest',
      email: 'guest@example.com',
      username: 'Guest',
      fullName: 'Guest User',
      phone: '123-456-7890',
      role: 'guest'
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(guestUser));
    this.currentUserSubject.next(guestUser);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();

    if (!user) return false;

    if (user.username === 'Guest') return true;

    return !!this.getToken();
  }

  signOut(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): AuthUser | null {
    const data = localStorage.getItem(this.USER_KEY);

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}