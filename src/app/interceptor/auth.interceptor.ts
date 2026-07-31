import { Injectable } from '@angular/core';
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
import { WaitlistAuthService } from '../services/waitlist-auth.service';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly publicApiUrls: string[] = [
    'https://dinerly-menu-api.onrender.com'
  ];

  constructor(
    private auth: WaitlistAuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = this.auth.getToken();

    const isPublicApi =
      this.publicApiUrls.some(
        publicUrl =>
          req.url.startsWith(publicUrl)
      );

    let requestToSend = req;

    if (token && !isPublicApi) {
      requestToSend = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(requestToSend).pipe(
      catchError(
        (error: HttpErrorResponse) => {

          if (
            error.status === 401 &&
            !isPublicApi
          ) {
            this.auth.signOut();
          }

          return throwError(
            () => error
          );
        }
      )
    );
  }
}