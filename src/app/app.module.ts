import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {AppRoutingModule} from './app-routing.module';


import {FullCalendarModule} from '@fullcalendar/angular';


import {AppCodeModule} from './blocks/app-code/app.code.component';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import {AppConfigComponent} from './app.config.component';
import {AppMenuComponent} from './app.menu.component';
import {AppMenuitemComponent} from './app.menuitem.component';
import {AppBreadcrumbComponent} from './app.breadcrumb.component';
import {AppTopBarComponent} from './app.topbar.component';
import {AppFooterComponent} from './app.footer.component';
import {DashboardComponent} from './demo/view/dashboard.component';
import {FormLayoutDemoComponent} from './demo/view/formlayoutdemo.component';
import {FloatLabelDemoComponent} from './demo/view/floatlabeldemo.component';
import {InvalidStateDemoComponent} from './demo/view/invalidstatedemo.component';
import {InputDemoComponent} from './demo/view/inputdemo.component';
import {ButtonDemoComponent} from './demo/view/buttondemo.component';
import {TableDemoComponent} from './demo/view/tabledemo.component';
import {ListDemoComponent} from './demo/view/listdemo.component';
import {TreeDemoComponent} from './demo/view/treedemo.component';
import {PanelsDemoComponent} from './demo/view/panelsdemo.component';
import {OverlaysDemoComponent} from './demo/view/overlaysdemo.component';
import {MediaDemoComponent} from './demo/view/mediademo.component';
import {MenusComponent} from './demo/view/menus/menus.component';
import {MessagesDemoComponent} from './demo/view/messagesdemo.component';
import {MiscDemoComponent} from './demo/view/miscdemo.component';
import {EmptyDemoComponent} from './demo/view/emptydemo.component';
import {ChartsDemoComponent} from './demo/view/chartsdemo.component';
import {FileDemoComponent} from './demo/view/filedemo.component';
import {DocumentationComponent} from './demo/view/documentation.component';
import {IconsComponent} from './utilities/icons.component';
import {AppCrudComponent} from './pages/app.crud.component';
import {AppCalendarComponent} from './pages/app.calendar.component';
import {AppInvoiceComponent} from './pages/app.invoice.component';
import {AppHelpComponent} from './pages/app.help.component';
import {AppNotfoundComponent} from './pages/app.notfound.component';
import {AppErrorComponent} from './pages/app.error.component';
import {AppAccessdeniedComponent} from './pages/app.accessdenied.component';
import {AppLoginComponent} from './pages/app.login.component';
import {AppTimelineDemoComponent} from './pages/app.timelinedemo.component';
import {BlockViewer} from './blocks/blockviewer/blockviewer.component';
import {BlocksComponent} from './blocks/blocks/blocks.component';

import {CountryService} from './demo/service/countryservice';
import {CustomerService} from './demo/service/customerservice';
import {EventService} from './demo/service/eventservice';
import {IconService} from './demo/service/iconservice';
import {NodeService} from './demo/service/nodeservice';
import {PhotoService} from './demo/service/photoservice';
import {ProductService} from './demo/service/productservice';
import {AppBreadcrumbService} from './app.breadcrumb.service';
import {MenuService} from './app.menu.service';
import {ConfigService} from './demo/service/app.config.service';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomTranslateLoader } from './../app/loader/customTranslate.loader';

import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-BH';
registerLocaleData(localeAr, 'ar');
import localeEn from '@angular/common/locales/en-US-POSIX';
// registerLocaleData(localeEn, 'en-US');
import localeFr from '@angular/common/locales/fr';
import { CommonService } from './service/common.service';
import { ApiService } from './shared/api.service';
import { SharedModule } from './shared/shared.module';
import { ContextService } from './shared/context.service';
// registerLocaleData(localeFr, 'fr-FR');
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SettingsModule } from './settings/settings.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BankingModule } from './banking/banking.module';
import { JournalsModule } from './journals/journals.module';
import { FinancialReportModule } from './financial-report/financial-report.module';
import { AccountingReportModule } from './accounting-report/accounting-report.module';


FullCalendarModule.registerPlugins([
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin
]);

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppCodeModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useClass: CustomTranslateLoader,
              deps: [HttpClient],
            },
          }),
          AmplifyAuthenticatorModule,
          FontAwesomeModule,
          SettingsModule,
          AngularSvgIconModule.forRoot(),
          BankingModule,
          JournalsModule,
          FinancialReportModule,
          AccountingReportModule
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppConfigComponent,
        AppBreadcrumbComponent,
        AppTopBarComponent,
        AppFooterComponent,
        DashboardComponent,
        FormLayoutDemoComponent,
        FloatLabelDemoComponent,
        InvalidStateDemoComponent,
        InputDemoComponent,
        ButtonDemoComponent,
        TableDemoComponent,
        ListDemoComponent,
        TreeDemoComponent,
        PanelsDemoComponent,
        OverlaysDemoComponent,
        MenusComponent,
        MediaDemoComponent,
        MessagesDemoComponent,
        MiscDemoComponent,
        ChartsDemoComponent,
        EmptyDemoComponent,
        FileDemoComponent,
        DocumentationComponent,
        IconsComponent,
        AppCrudComponent,
        AppCalendarComponent,
        AppLoginComponent,
        AppInvoiceComponent,
        AppHelpComponent,
        AppNotfoundComponent,
        AppErrorComponent,
        AppTimelineDemoComponent,
        AppAccessdeniedComponent,
        BlocksComponent,
        BlockViewer
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, MenuService, AppBreadcrumbService, ConfigService,CommonService,ApiService,ContextService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
