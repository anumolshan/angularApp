import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineCalenderComponent } from './define-calendar.component';

describe('DefineCalenderComponent', () => {
  let component: DefineCalenderComponent;
  let fixture: ComponentFixture<DefineCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefineCalenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
