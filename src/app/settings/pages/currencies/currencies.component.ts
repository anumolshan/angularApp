import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent implements OnInit {
  products:any[];

  constructor(private router:Router,public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService) { 
    this.breadcrumbService.setItems([
      { label: 'settings.pages.currencies.breadcrumbs.breadcrumb1',routerLink: '/settings' },
      { label: 'settings.pages.currencies.breadcrumbs.breadcrumb2',routerLink: '/settings/currencies' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    this.products = [
      {
        code: "Omani Rial",
        name: "1000",
        category: "1.000",
        quantity: "24"
      },
      {
        code: "USD",
        name: "1000",
        category: "1.000",
        quantity: "24"
      },
     
      {
        code: "Indian Rupee",
        name: "1000",
        category: "1.000",
        quantity: "24"
      },
    ]
  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage != this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }

}
