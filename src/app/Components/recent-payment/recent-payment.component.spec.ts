import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPaymentComponent } from './recent-payment.component';

describe('RecentPaymentComponent', () => {
  let component: RecentPaymentComponent;
  let fixture: ComponentFixture<RecentPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
