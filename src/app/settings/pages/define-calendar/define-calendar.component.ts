import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-define-calender',
  templateUrl: './define-calendar.component.html',
  styleUrls: ['./define-calendar.component.scss']
})
export class DefineCalenderComponent implements OnInit {
  value: Date;
  startDate: Date;
  endDate:Date
  lockoutDate:Date
  taxYearEndDate:Date
  constructor(public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.define_calender.breadcrumbs.breadcrumb1',routerLink: '/settings' },
      { label: 'settings.pages.define_calender.breadcrumbs.breadcrumb2',routerLink: '/settings/define-calendar' }

    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
   }

  ngOnInit(): void {
  
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
