import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  BehaviorSubject,
  Observable,
  map,
  tap
} from 'rxjs';

import type {
  AuthUser,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailResponse
} from '../models/waitlist-auth.model';

import {
  environment
} from 'src/environments/environment.prod';


export type AuthScope =
  | 'guest'
  | 'restaurant'
  | 'admin';


interface AuthStorageKeys {
  token: string;
  user: string;
}


@Injectable({
  providedIn: 'root'
})
export class WaitlistAuthService {

  private readonly baseUrl =
    environment.apiUrl;


  /* =====================================================
     STORAGE KEYS
  ====================================================== */

  private readonly STORAGE_KEYS:
    Record<AuthScope, AuthStorageKeys> = {

      guest: {
        token: 'waitlist_guest_token',
        user: 'waitlist_guest_user'
      },

      restaurant: {
        token: 'waitlist_restaurant_token',
        user: 'waitlist_restaurant_user'
      },

      admin: {
        token: 'waitlist_admin_token',
        user: 'waitlist_admin_user'
      }
    };


  /* =====================================================
     CURRENT USERS
  ====================================================== */

  private readonly guestUserSubject =
    new BehaviorSubject<AuthUser | null>(
      this.getStoredUser('guest')
    );

  private readonly restaurantUserSubject =
    new BehaviorSubject<AuthUser | null>(
      this.getStoredUser('restaurant')
    );

  private readonly adminUserSubject =
    new BehaviorSubject<AuthUser | null>(
      this.getStoredUser('admin')
    );


  guestUser$ =
    this.guestUserSubject.asObservable();

  restaurantUser$ =
    this.restaurantUserSubject.asObservable();

  adminUser$ =
    this.adminUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  /* =====================================================
     LOGIN
  ====================================================== */

  login(
    email: string,
    password: string,
    scope: AuthScope
  ): Observable<AuthUser> {

    const payload = {
      email:
        email
          .trim()
          .toLowerCase(),

      password
    };

    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        payload
      )
      .pipe(
        tap(response => {

          const user =
            response?.data?.user;

          if (!user) {
            throw new Error(
              response?.message ||
              'Invalid authentication response'
            );
          }

          /*
           * Validate that the logged-in account
           * belongs to the requested login page.
           */
          if (
            !this.isUserAllowedForScope(
              user,
              scope
            )
          ) {
            throw new Error(
              this.getInvalidRoleMessage(scope)
            );
          }

          this.storeAuthenticationResponse(
            response,
            scope
          );
        }),

        map(response => {
          return response.data.user;
        })
      );
  }


  /* =====================================================
     GUEST LOGIN
  ====================================================== */

  loginGuest(
    email: string,
    password: string
  ): Observable<AuthUser> {

    return this.login(
      email,
      password,
      'guest'
    );
  }


  /* =====================================================
     RESTAURANT LOGIN
  ====================================================== */

  loginRestaurant(
    email: string,
    password: string
  ): Observable<AuthUser> {

    return this.login(
      email,
      password,
      'restaurant'
    );
  }


  /* =====================================================
     ADMIN LOGIN
  ====================================================== */

  loginAdmin(
    email: string,
    password: string
  ): Observable<AuthUser> {

    return this.login(
      email,
      password,
      'admin'
    );
  }


  /* =====================================================
     REGISTER GUEST ACCOUNT
  ====================================================== */

  register(
    payload: RegisterRequest
  ): Observable<RegisterResponse> {

    const requestBody:
      RegisterRequest = {

      name:
        payload.name.trim(),

      email:
        payload.email
          .trim()
          .toLowerCase(),

      phone:
        payload.phone.trim(),

      password:
        payload.password
    };

    return this.http
      .post<RegisterResponse>(
        `${this.baseUrl}/auth/register`,
        requestBody
      );
  }


  verifyEmail(
    token: string
  ): Observable<VerifyEmailResponse> {

    const params =
      new HttpParams()
        .set(
          'token',
          token
        );

    return this.http
      .get<VerifyEmailResponse>(
        `${this.baseUrl}/auth/verify-email`,
        {
          params
        }
      );
  }


  /* =====================================================
     STORE AUTHENTICATION
  ====================================================== */

  private storeAuthenticationResponse(
    response: LoginResponse,
    scope: AuthScope
  ): void {

    const token =
      response?.data?.token;

    const user =
      response?.data?.user;

    if (!token || !user) {
      throw new Error(
        response?.message ||
        'Invalid authentication response'
      );
    }

    const keys =
      this.STORAGE_KEYS[scope];

    localStorage.setItem(
      keys.token,
      token
    );

    localStorage.setItem(
      keys.user,
      JSON.stringify(user)
    );

    this.getUserSubject(scope)
      .next(user);
  }


  /* =====================================================
     GET TOKEN
  ====================================================== */

  getToken(
    scope: AuthScope
  ): string | null {

    const keys =
      this.STORAGE_KEYS[scope];

    return localStorage.getItem(
      keys.token
    );
  }


  getGuestToken(): string | null {

    return this.getToken(
      'guest'
    );
  }


  getRestaurantToken(): string | null {

    return this.getToken(
      'restaurant'
    );
  }


  getAdminToken(): string | null {

    return this.getToken(
      'admin'
    );
  }


  /* =====================================================
     GET CURRENT USER
  ====================================================== */

  getCurrentUser(
    scope: AuthScope
  ): AuthUser | null {

    return this.getUserSubject(
      scope
    ).value;
  }


  getGuestUser(): AuthUser | null {

    return this.getCurrentUser(
      'guest'
    );
  }


  getRestaurantUser(): AuthUser | null {

    return this.getCurrentUser(
      'restaurant'
    );
  }


  getAdminUser(): AuthUser | null {

    return this.getCurrentUser(
      'admin'
    );
  }


  /* =====================================================
     CHECK LOGIN STATUS
  ====================================================== */

  isLoggedIn(
    scope: AuthScope
  ): boolean {

    return Boolean(
      this.getToken(scope) &&
      this.getCurrentUser(scope)
    );
  }


  isGuestLoggedIn(): boolean {

    return this.isLoggedIn(
      'guest'
    );
  }


  isRestaurantLoggedIn(): boolean {

    return this.isLoggedIn(
      'restaurant'
    );
  }


  isAdminLoggedIn(): boolean {

    return this.isLoggedIn(
      'admin'
    );
  }


  /* =====================================================
     ROLE CHECKS
  ====================================================== */

  hasRole(
    requiredRole: string,
    scope: AuthScope
  ): boolean {

    const user =
      this.getCurrentUser(scope);

    if (!user) {
      return false;
    }

    return (
      this.getNormalizedRole(user) ===
      requiredRole
        .trim()
        .toLowerCase()
    );
  }


  isGuestUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user ||
      this.getGuestUser();

    return (
      this.getNormalizedRole(
        currentUser
      ) === 'guest'
    );
  }


  isRestaurantUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user ||
      this.getRestaurantUser();

    return (
      this.getNormalizedRole(
        currentUser
      ) === 'restaurant'
    );
  }


  isAdminUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user ||
      this.getAdminUser();

    return (
      this.getNormalizedRole(
        currentUser
      ) === 'admin'
    );
  }


  private getNormalizedRole(
    user:
      AuthUser |
      null |
      undefined
  ): string {

    if (!user) {
      return '';
    }

    return String(
      user.role ||
      user.username ||
      ''
    )
      .trim()
      .toLowerCase();
  }


  private isUserAllowedForScope(
    user: AuthUser,
    scope: AuthScope
  ): boolean {

    const role =
      this.getNormalizedRole(user);

    return role === scope;
  }


  private getInvalidRoleMessage(
    scope: AuthScope
  ): string {

    if (scope === 'guest') {
      return (
        'This account is not a guest account. ' +
        'Please use the correct login page.'
      );
    }

    if (scope === 'restaurant') {
      return (
        'This account is not a restaurant account. ' +
        'Please use the correct login page.'
      );
    }

    return (
      'This account is not an administrator account. ' +
      'Please use the correct login page.'
    );
  }


  /* =====================================================
     LOGOUT
  ====================================================== */

  signOut(
    scope: AuthScope,
    navigate = true
  ): void {

    const keys =
      this.STORAGE_KEYS[scope];

    localStorage.removeItem(
      keys.token
    );

    localStorage.removeItem(
      keys.user
    );

    this.getUserSubject(scope)
      .next(null);

    if (!navigate) {
      return;
    }

    if (scope === 'guest') {
      this.router.navigate(
        ['/user']
      );

      return;
    }

    if (scope === 'admin') {
      this.router.navigate(
        ['/login/admin']
      );

      return;
    }

    this.router.navigate(
      ['/login/restaurant']
    );
  }


  signOutGuest(
    navigate = true
  ): void {

    this.signOut(
      'guest',
      navigate
    );
  }


  signOutRestaurant(
    navigate = true
  ): void {

    this.signOut(
      'restaurant',
      navigate
    );
  }


  signOutAdmin(
    navigate = true
  ): void {

    this.signOut(
      'admin',
      navigate
    );
  }


  /* =====================================================
     CLEAR ALL AUTHENTICATION
  ====================================================== */

  signOutAll(): void {

    this.clearAuthentication(
      'guest'
    );

    this.clearAuthentication(
      'restaurant'
    );

    this.clearAuthentication(
      'admin'
    );

    this.router.navigate(
      ['/login/restaurant']
    );
  }


  private clearAuthentication(
    scope: AuthScope
  ): void {

    const keys =
      this.STORAGE_KEYS[scope];

    localStorage.removeItem(
      keys.token
    );

    localStorage.removeItem(
      keys.user
    );

    this.getUserSubject(scope)
      .next(null);
  }


  /* =====================================================
     READ STORED USER
  ====================================================== */

  private getStoredUser(
    scope: AuthScope
  ): AuthUser | null {

    const keys =
      this.STORAGE_KEYS[scope];

    const data =
      localStorage.getItem(
        keys.user
      );

    if (!data) {
      return null;
    }

    try {

      return JSON.parse(
        data
      ) as AuthUser;

    } catch {

      localStorage.removeItem(
        keys.user
      );

      localStorage.removeItem(
        keys.token
      );

      return null;
    }
  }


  /* =====================================================
     GET CORRECT SUBJECT
  ====================================================== */

  private getUserSubject(
    scope: AuthScope
  ): BehaviorSubject<AuthUser | null> {

    if (scope === 'guest') {
      return this.guestUserSubject;
    }

    if (scope === 'admin') {
      return this.adminUserSubject;
    }

    return this.restaurantUserSubject;
  }

}