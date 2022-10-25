import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { FinancialReportRoutingModule } from './financial-report-routing.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '../loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { SharedModule } from '../shared/shared.module';
import { FinancialReportsService } from './service/financial-reports.service';
import { TrialBalanceComponent } from './pages/trial-balance/trial-balance.component';
import { BalanceSheetComponent } from './pages/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './pages/profit-loss/profit-loss.component';




@NgModule({
  declarations: [
  
      TrialBalanceComponent,
          BalanceSheetComponent,
          ProfitLossComponent,
          
  ],
  imports: [
    CommonModule,
    FinancialReportRoutingModule,
     SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [DatePipe,MessageService,ConfirmationService,ApiService,CurrencyPipe,FinancialReportsService]
})
export class FinancialReportModule { }
