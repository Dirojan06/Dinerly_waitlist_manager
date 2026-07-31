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


@Injectable({
  providedIn: 'root'
})
export class WaitlistAuthService {

  private readonly baseUrl =
    environment.apiUrl;

  private readonly TOKEN_KEY =
    'waitlist_token';

  private readonly USER_KEY =
    'waitlist_user';

  private currentUserSubject =
    new BehaviorSubject<AuthUser | null>(
      this.getStoredUser()
    );

  currentUser$ =
    this.currentUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  /* =====================================================
     LOGIN

     This method remains exactly compatible with:

     this.auth.login(email, password)
  ====================================================== */

  login(
    email: string,
    password: string
  ): Observable<AuthUser> {

    const payload = {
      email: email.trim().toLowerCase(),
      password
    };

    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        payload
      )
      .pipe(
        tap(response => {
          this.storeAuthenticationResponse(
            response
          );
        }),

        map(response => {
          return response.data.user;
        })
      );
  }


  /* =====================================================
     REGISTER GUEST ACCOUNT
  ====================================================== */

  register(
  payload: RegisterRequest
): Observable<RegisterResponse> {

  const requestBody: RegisterRequest = {
    name: payload.name.trim(),

    email:
      payload.email
        .trim()
        .toLowerCase(),

    phone:
      payload.phone.trim(),

    password:
      payload.password
  };

  return this.http.post<RegisterResponse>(
    `${this.baseUrl}/auth/register`,
    requestBody
  );
}

  verifyEmail(
  token: string
): Observable<VerifyEmailResponse> {

  const params = new HttpParams()
    .set('token', token);

  return this.http.get<VerifyEmailResponse>(
    `${this.baseUrl}/auth/verify-email`,
    {
      params
    }
  );
}


  /* =====================================================
     STORE TOKEN AND USER
  ====================================================== */

  private storeAuthenticationResponse(
    response: LoginResponse
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

    localStorage.setItem(
      this.TOKEN_KEY,
      token
    );

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(user)
    );

    this.currentUserSubject.next(user);
  }


  /* =====================================================
     TOKEN
  ====================================================== */

  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }


  /* =====================================================
     CURRENT USER
  ====================================================== */

  getCurrentUser(): AuthUser | null {

    return this.currentUserSubject.value;
  }


  /* =====================================================
     CHECK LOGGED-IN STATUS
  ====================================================== */

  isLoggedIn(): boolean {

    return (
      !!this.getToken() &&
      !!this.getCurrentUser()
    );
  }


  /* =====================================================
     CHECK USER ROLE
  ====================================================== */

  hasRole(
    requiredRole: string
  ): boolean {

    const user =
      this.getCurrentUser();

    if (!user) {
      return false;
    }

    const currentRole =
      (
        user.role ||
        user.username ||
        ''
      )
        .trim()
        .toLowerCase();

    return (
      currentRole ===
      requiredRole.trim().toLowerCase()
    );
  }


  isGuestUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user || this.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const username =
      currentUser.username
        ?.trim()
        .toLowerCase();

    const role =
      currentUser.role
        ?.trim()
        .toLowerCase();

    return (
      username === 'guest' ||
      role === 'guest'
    );
  }


  isRestaurantUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user || this.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const username =
      currentUser.username
        ?.trim()
        .toLowerCase();

    const role =
      currentUser.role
        ?.trim()
        .toLowerCase();

    return (
      username === 'restaurant' ||
      role === 'restaurant'
    );
  }


  isAdminUser(
    user?: AuthUser | null
  ): boolean {

    const currentUser =
      user || this.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const username =
      currentUser.username
        ?.trim()
        .toLowerCase();

    const role =
      currentUser.role
        ?.trim()
        .toLowerCase();

    return (
      username === 'admin' ||
      role === 'admin'
    );
  }


  /* =====================================================
     SIGN OUT
  ====================================================== */

  signOut(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.USER_KEY
    );

    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }


  /* =====================================================
     READ STORED USER
  ====================================================== */

  private getStoredUser():
    AuthUser | null {

    const data =
      localStorage.getItem(
        this.USER_KEY
      );

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as AuthUser;

    } catch {

      localStorage.removeItem(
        this.USER_KEY
      );

      return null;
    }
  }
}