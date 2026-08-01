import {
  Injectable
} from '@angular/core';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import {
  Observable,
  catchError,
  throwError
} from 'rxjs';

import {
  WaitlistAuthService
} from '../services/waitlist-auth.service';

@Injectable()
export class AuthInterceptor
  implements HttpInterceptor {

  private readonly publicApiUrls = [

    'https://dinerly-menu-api.onrender.com'

  ];

  constructor(
    private auth: WaitlistAuthService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const isPublicApi =
      this.publicApiUrls.some(
        url =>
          req.url.startsWith(url)
      );

    if (isPublicApi) {
      return next.handle(req);
    }

    let token: string | null = null;

    /*
     * Decide which token should be attached
     * based on the request URL.
     */

    if (
      req.url.includes('/restaurants/')
    ) {

      token =
        this.auth.getRestaurantToken()
        ||
        this.auth.getAdminToken();

    } else if (

      req.url.includes('/waitlist') ||

      req.url.includes('/feedback') ||

      req.url.includes('/auth')

    ) {

      token =
        this.auth.getGuestToken();

    }

    let request = req;

    if (token) {

      request = req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

        }

      });

    }

    return next
      .handle(request)
      .pipe(

        catchError(
          (
            error:
              HttpErrorResponse
          ) => {

            if (
              error.status === 401
            ) {

              /*
               * Guest request
               */

              if (
                req.url.includes('/waitlist') ||
                req.url.includes('/feedback')
              ) {

                this.auth.signOutGuest(
                  false
                );

              }

              /*
               * Restaurant/Admin request
               */

              if (
                req.url.includes('/restaurants/')
              ) {

                this.auth.signOutRestaurant(
                  false
                );

                this.auth.signOutAdmin(
                  false
                );

              }

            }

            return throwError(
              () => error
            );

          }

        )

      );

  }

}