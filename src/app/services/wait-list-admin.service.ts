import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { WaitlistAuthService } from './waitlist-auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GuestHistoryResponse } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class WaitListAdminService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: WaitlistAuthService) { }

  getRestaurantGuestHistory(restaurantId: number, page: number, size: number, status: string, date: string): Observable<any> {

    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }
    if (date) {
      params = params.set('date', date);
    }
    if (page) {
      params = params.set('page', page);
    }
    if (size) {
      params = params.set('size', size);
    }
    return this.http.get<GuestHistoryResponse>(`${this.baseUrl}/admin/${restaurantId}/guest-history`, { headers, params });
  }

  // download guest history as csv api 

  exportGuestHistoryCsv(restaurantId: number, status: string, date: string): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get(
      `${this.baseUrl}/admin/${restaurantId}/guest-history/export`, { headers, params, responseType: 'blob' });
  }

  //reports api

  getRestaurantReports(restaurantId: number, fromDate?: string, toDate?: string): Observable<any> {

    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let params = new HttpParams();

    if (fromDate && fromDate.trim() !== '') {
      params = params.set('fromDate', fromDate);
    }

    if (toDate && toDate.trim() !== '') {
      params = params.set('toDate', toDate);
    }

    return this.http.get<any>(`${this.baseUrl}/admin/${restaurantId}/reports`, { headers, params });
  }
}
