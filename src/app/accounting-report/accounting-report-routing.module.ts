import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayBookComponent } from './pages/day-book/day-book.component';
import { ViewAccountLedgerComponent } from './pages/view-account-ledger/view-account-ledger.component';

const routes: Routes = [
  {
    path: 'account-ledger', component:ViewAccountLedgerComponent
  },
  { 
    path: 'day-book', component:DayBookComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingReportRoutingModule { }
