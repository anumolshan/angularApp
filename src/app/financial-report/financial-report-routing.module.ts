import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceSheetComponent } from './pages/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './pages/profit-loss/profit-loss.component';
import { TrialBalanceComponent } from './pages/trial-balance/trial-balance.component';



const routes: Routes = [
  {
    path: 'trial-balance', component:TrialBalanceComponent
  },
  {
    path: 'balance-sheet', component:BalanceSheetComponent
  },
  {
    path: 'profit-loss', component:ProfitLossComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialReportRoutingModule { }
