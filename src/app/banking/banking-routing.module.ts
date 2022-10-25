import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContraVouchersComponent } from './pages/contra-vouchers/contra-vouchers.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ReceiptComponent } from './pages/receipt/receipt.component';
import { ViewReceiptComponent } from './pages/view-receipt/view-receipt.component';
import { ViewContraVouchersComponent } from './pages/view-contra-vouchers/view-contra-vouchers.component';

const routes: Routes = [
  {
    path: 'receipt', component: ReceiptComponent
  },
  {
    path: 'payment', component: PaymentComponent
  },
  {
    path: 'contra-vouchers', component: ContraVouchersComponent
  },
  {
    path: 'view-contra-vouchers', component: ViewContraVouchersComponent
  },
  {
    path: 'view-receipt', component: ViewReceiptComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankingRoutingModule { }
