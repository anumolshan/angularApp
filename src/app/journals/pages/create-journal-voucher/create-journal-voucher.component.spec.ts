import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJournalVoucherComponent } from './create-journal-voucher.component';

describe('CreateJournalVoucherComponent', () => {
  let component: CreateJournalVoucherComponent;
  let fixture: ComponentFixture<CreateJournalVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateJournalVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJournalVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
