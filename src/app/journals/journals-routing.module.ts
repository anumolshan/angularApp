import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateJournalVoucherComponent } from './pages/create-journal-voucher/create-journal-voucher.component';
import { ViewJournalComponent } from './pages/view-journal/view-journal.component';

const routes: Routes = [
  { path: 'create-journal', component:CreateJournalVoucherComponent},
  { path: 'view-journal', component:ViewJournalComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalsRoutingModule { }
