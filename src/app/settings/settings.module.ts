import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './pages/settings/settings.component';
import { ConfirmationService, MessageService, TreeDragDropService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '../loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';
import { DefineCalenderComponent } from './pages/define-calendar/define-calendar.component';
import { SettingsService } from './service/settings.service';
import { CurrenciesComponent } from './pages/currencies/currencies.component';
import { NodeService } from '../demo/service/nodeservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';



@NgModule({
  declarations: [
    SettingsComponent,
    ChartOfAccountsComponent,
    DefineCalenderComponent,
    CurrenciesComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ConfirmDialogModule
    ],
  providers: [DatePipe,MessageService,ConfirmationService,SettingsService,NodeService,TreeDragDropService]
})
export class SettingsModule { }
