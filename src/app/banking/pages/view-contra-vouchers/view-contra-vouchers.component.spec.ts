import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewContraVouchersComponent } from './view-contra-vouchers.component';

describe('ViewContraVouchersComponent', () => {
  let component: ViewContraVouchersComponent;
  let fixture: ComponentFixture<ViewContraVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewContraVouchersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewContraVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
