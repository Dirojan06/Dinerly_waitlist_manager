import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitlistReportsComponent } from './waitlist-reports.component';

describe('WaitlistReportsComponent', () => {
  let component: WaitlistReportsComponent;
  let fixture: ComponentFixture<WaitlistReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitlistReportsComponent]
    });
    fixture = TestBed.createComponent(WaitlistReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
