import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContraVouchersComponent } from './contra-vouchers.component';

describe('ContraVouchersComponent', () => {
  let component: ContraVouchersComponent;
  let fixture: ComponentFixture<ContraVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContraVouchersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContraVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
