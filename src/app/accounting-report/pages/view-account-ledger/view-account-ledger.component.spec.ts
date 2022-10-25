import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountLedgerComponent } from './view-account-ledger.component';

describe('ViewAccountLedgerComponent', () => {
  let component: ViewAccountLedgerComponent;
  let fixture: ComponentFixture<ViewAccountLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAccountLedgerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
