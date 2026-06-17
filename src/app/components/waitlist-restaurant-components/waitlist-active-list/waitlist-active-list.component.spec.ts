import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitlistActiveListComponent } from './waitlist-active-list.component';

describe('WaitlistActiveListComponent', () => {
  let component: WaitlistActiveListComponent;
  let fixture: ComponentFixture<WaitlistActiveListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitlistActiveListComponent]
    });
    fixture = TestBed.createComponent(WaitlistActiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
