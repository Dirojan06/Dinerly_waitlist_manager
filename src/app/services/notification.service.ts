import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  private pendingCountSubject = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCountSubject.asObservable();

  setPendingCount(count: number): void {
    this.pendingCountSubject.next(count);
  }

  increasePendingCount(): void {
    this.pendingCountSubject.next(this.pendingCountSubject.value + 1);
  }

  clear(): void {
    this.pendingCountSubject.next(0);
  }
}
