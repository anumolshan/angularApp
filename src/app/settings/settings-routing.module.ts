import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts.component';
import { CurrenciesComponent } from './pages/currencies/currencies.component';
import { DefineCalenderComponent } from './pages/define-calendar/define-calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  {
  path:'',
  component:SettingsComponent
  },
  {
    path:'chart-accounts',
    component:ChartOfAccountsComponent
  },
  {
    path:'define-calendar',
    component:DefineCalenderComponent
  },
  {
    path:'currencies',
    component:CurrenciesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
