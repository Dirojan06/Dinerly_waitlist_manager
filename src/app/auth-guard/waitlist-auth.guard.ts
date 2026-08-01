import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';

import { WaitlistAuthService } from '../services/waitlist-auth.service';

@Injectable({
  providedIn: 'root'
})
export class WaitlistAuthGuard implements CanActivate {

  constructor(
    private auth: WaitlistAuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot
  ): boolean | UrlTree {

    const scope =
      route.data['scope'];

    switch (scope) {

      case 'restaurant':

        if (
          this.auth.isRestaurantLoggedIn()
        ) {
          return true;
        }

        return this.router.createUrlTree([
          '/login/restaurant'
        ]);

      case 'admin':

        if (
          this.auth.isAdminLoggedIn()
        ) {
          return true;
        }

        return this.router.createUrlTree([
          '/login/admin'
        ]);

      case 'guest':

        if (
          this.auth.isGuestLoggedIn()
        ) {
          return true;
        }

        return this.router.createUrlTree([
          '/user'
        ]);

      default:

        return this.router.createUrlTree([
          '/login'
        ]);

    }

  }

}