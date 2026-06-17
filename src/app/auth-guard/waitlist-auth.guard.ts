import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { WaitlistAuthService } from '../services/waitlist-auth.service';
import { UserRole } from '../models/waitlist-auth.model';

@Injectable({
  providedIn: 'root'
})
export class WaitlistAuthGuard implements CanActivate {

  constructor(
    private auth: WaitlistAuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {

    if (!this.auth.isLoggedIn()) {

      return this.router.createUrlTree(['/login']);

    }

    return true;

  }
}