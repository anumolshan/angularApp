import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { JournalsRoutingModule } from './journals-routing.module';
import { CreateJournalVoucherComponent } from './pages/create-journal-voucher/create-journal-voucher.component';
import { ViewJournalComponent } from './pages/view-journal/view-journal.component';
import { SharedModule } from '../shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '../loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { JournalService } from './service/journal.service';


@NgModule({
  declarations: [
    CreateJournalVoucherComponent,
    ViewJournalComponent
  ],
  imports: [
    CommonModule,
    JournalsRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [DatePipe,MessageService,ConfirmationService,ApiService,JournalService,CurrencyPipe]
})
export class JournalsModule { }
