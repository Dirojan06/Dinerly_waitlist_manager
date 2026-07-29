import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Category, Dish } from '../models/waitlist-menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl = `${environment.menuApiUrl}/categories`;

  private dishByCategoryUrl = `${environment.menuApiUrl}/dishes/category`

  private dishById = `${environment.menuApiUrl}/dishes`
  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getDishesByCategory(categoryName: string): Observable<Dish[]> {
    return this.http.get<Dish[]>(
      `${this.dishByCategoryUrl}/${encodeURIComponent(categoryName)}`
    );
  }
  getDishById(id: number) {
    return this.http.get<Dish>(
      `${this.dishById}/${encodeURIComponent(id)}`
    );
  }
}
