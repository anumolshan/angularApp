import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { AccountingReportRoutingModule } from './accounting-report-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '../loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../shared/api.service';
import { DayBookComponent } from './pages/day-book/day-book.component';
import { ViewAccountLedgerComponent } from './pages/view-account-ledger/view-account-ledger.component';


@NgModule({
  declarations: [
    DayBookComponent,
    ViewAccountLedgerComponent
  ],
  imports: [
    CommonModule,
    AccountingReportRoutingModule,
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
export class AccountingReportModule { }
