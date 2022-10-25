import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BankingRoutingModule } from './banking-routing.module';
import { ReceiptComponent } from './pages/receipt/receipt.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ContraVouchersComponent } from './pages/contra-vouchers/contra-vouchers.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '../loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { ViewReceiptComponent } from './pages/view-receipt/view-receipt.component';
import { ViewContraVouchersComponent } from './pages/view-contra-vouchers/view-contra-vouchers.component';

@NgModule({
  declarations: [
    ReceiptComponent,
    PaymentComponent,
    ContraVouchersComponent,
    ViewReceiptComponent,
    ViewContraVouchersComponent
  ],
  imports: [
    CommonModule,
    BankingRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [DatePipe,MessageService,ConfirmationService,ApiService,CurrencyPipe]

})
export class BankingModule { }
