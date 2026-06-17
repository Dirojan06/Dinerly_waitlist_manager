import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitlistHistoryComponent } from './waitlist-history.component';

describe('WaitlistHistoryComponent', () => {
  let component: WaitlistHistoryComponent;
  let fixture: ComponentFixture<WaitlistHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitlistHistoryComponent]
    });
    fixture = TestBed.createComponent(WaitlistHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
