import { Injectable } from '@angular/core';
import { JoinWaitlistRequest, ApproveWaitlistRequest, getGuestWaitingStatus, PendingGuestResponse, WaitingGuestResponse, NotifiedGuestResponse, SeatedGuestResponse, DashboardWaitlistResponse, notifiyguestcallRequest, TablelistResponse, addGuestToWaitlistRequest, seatedGuestcallRequest, CancelledGuestResponse, DashboardResponse, addTabletoRestaurantRequest, GuestHistoryResponse, RestaurantResponse } from '../models/waitlist-api-guest-to-restaurant.model';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WaitlistAuthService } from './waitlist-auth.service';
import { sendNotificationRequest } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class WaitlistApiRestaurantService {

  private readonly baseUrl = environment.apiUrl;
  constructor(private http: HttpClient, private auth: WaitlistAuthService) { }

  // ************************************************************************************ GUEST API STARTS ******************************************************************************* //

  // this is for user or guest api to join the waitlist
  joinWaitlist(payload: JoinWaitlistRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/waitlist`, payload);
  }

  // this is for user or guest api to get the satus
  getWaitlistStatus(payload: getGuestWaitingStatus): Observable<any> {
    return this.http.post(`${this.baseUrl}/waitlist/status`, payload);
  }

  // this is for user or guest api for leave from the joinlist
  leaveWaitlistTable(restaurantId: number, waitlistId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/waitlist/${restaurantId}/${waitlistId}`);
  }

  getwaitlistdashBoardStatus(restaurantId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/waitlist/${restaurantId}/dashboard`);
  }

  submitFeedback(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/feedback`, payload);
  }


  //********************* dummy request  ******************************************/
  requestWaitlistRestore(restaurantId: number, phone: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/waitlist/${restaurantId}/restore`, { phone });
  }

  sendArrivalConfirmation(restaurantId: number, waitlistId: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/waitlist/${restaurantId}/${waitlistId}/arrival`, payload);
  }

  // ************************************************************************************ GUEST API ENDS ******************************************************************************* //


  // ************************************************************************************ RESTAURANT  API STARTS ******************************************************************************* //

  // get restaurant id api
  getRestaurantDetails(): Observable<RestaurantResponse> {

    return this.http.get<RestaurantResponse>(`${this.baseUrl}/waitlist/restaurants`);
  }


  // get dashboard data api
  getDashboardData(restaurantId: number): Observable<DashboardResponse> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<DashboardResponse>(`${this.baseUrl}/restaurants/${restaurantId}/dashboard`, { headers });

  }

  getDashboardStatus(restaurantId: number): Observable<DashboardWaitlistResponse> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<DashboardWaitlistResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers });

  }

  addGuestInWaitlist(restaurantId: number, payload: addGuestToWaitlistRequest): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, payload, { headers });
  }

  // Get guests based on restaurantId and optional filters api
  getGuestsStatus(restaurantId: number, status?: string, date?: string): Observable<PendingGuestResponse> {
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
    return this.http.get<PendingGuestResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers, params });

  }

  // Get waiting guests based on restaurantId and optional filters
  getWaitingGuests(restaurantId: number, status?: string, date?: string): Observable<WaitingGuestResponse> {
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
    return this.http.get<WaitingGuestResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers, params });

  }

  // Get notified guests based on restaurantId and optional filters api
  getNotifiedGuests(restaurantId: number, status?: string, date?: string): Observable<NotifiedGuestResponse> {
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
    return this.http.get<NotifiedGuestResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers, params });

  }

  // Get seated guests based on restaurantId and optional filters api
  getSeatedGuests(restaurantId: number, status?: string, date?: string): Observable<SeatedGuestResponse> {
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
    return this.http.get<SeatedGuestResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers, params });

  }

  // Get cancelled guests based on restaurantId and optional filters api
  getCancelledGuests(restaurantId: number, status?: string, date?: string): Observable<CancelledGuestResponse> {
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
    return this.http.get<CancelledGuestResponse>(`${this.baseUrl}/restaurants/${restaurantId}/waitlist`, { headers, params });

  }

  // approve guest in pending list api
  approveGuest(restaurantId: number, waitlistId: number, payload: ApproveWaitlistRequest): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/waitlist/${waitlistId}/approve`, payload, { headers });
  }

  // reject guest in the pending list api
  rejectGuest(restaurantId: number, waitlistId: number): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}/restaurants/${restaurantId}/waitlist/${waitlistId}`, { headers });
  }

  // notify guest api
  notifyToGuest(restaurantId: number, waitlistId: number, payload: notifiyguestcallRequest): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/waitlist/${waitlistId}/notify`, payload, { headers });
  }

  //seated guest api
  seatedGuest(restaurantId: number, waitlistId: number, payload?: seatedGuestcallRequest): Observable<any> {

    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/waitlist/${waitlistId}/seat`, payload, { headers });
  }

  //get restaurant tables list api
  getRestaurantTableslist(restaurantId: number): Observable<any> {

    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<TablelistResponse>(`${this.baseUrl}/restaurants/${restaurantId}/tables`, { headers });
  }

  //update restaurant table status api

  updateTableStatus(restaurantId: number, tableId: number, status: string): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }
    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/tables/${tableId}/status`, null, { headers, params });
  }

  // add table to restaurant api
  addTabletoRestaurant(restaurantId: number, payload: addTabletoRestaurantRequest): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/tables`, payload, { headers });
  }

  // send custom notification to guest api

  sendNoficationToGuest(restaurantId: number, waitlistId: number, payload: sendNotificationRequest): Observable<any> {
      const token = this.auth.getToken();
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/notifications/${waitlistId}/send-sms`, payload, { headers });
    }

  // delete guest from waitlist api
  deleteGuestFromWaitlist(restaurantId: number, waitlistId: number): Observable<any> {
    const token = this.auth.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}/restaurants/${restaurantId}/waitlist/${waitlistId}`, { headers });
  }



  //History API

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
    return this.http.get<GuestHistoryResponse>(`${this.baseUrl}/restaurants/${restaurantId}/guest-history`, { headers, params });
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
      `${this.baseUrl}/restaurants/${restaurantId}/guest-history/export`, { headers, params, responseType: 'blob' });
  }


  // ************************************************************************************ RESTAURANTS API ENDS ******************************************************************************* //



}
