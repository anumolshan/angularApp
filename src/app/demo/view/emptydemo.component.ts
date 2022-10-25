import {Component} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/service/common.service';
import {AppBreadcrumbService} from '../../app.breadcrumb.service';

@Component({
    templateUrl: './emptydemo.component.html'
})
export class EmptyDemoComponent {

    name:string = "Jibin"
    desigination:string = "TL"
    amount : number = 12345.6789;
    city: string;

selectedCategory: any = null;

categories: any[] = [{name: 'Accounting', key: 'A'}, {name: 'Marketing', key: 'M'}, {name: 'Production', key: 'P'}, {name: 'Research', key: 'R'}];

    constructor(private breadcrumbService: AppBreadcrumbService,public translateService: TranslateService,public commonService: CommonService) {
        this.breadcrumbService.setItems([
            {label: 'settings.pages.dashboard.breadcrumbs.breadcrumb1'}
        ]);
    //   translateService.setDefaultLang('en');
    // translateService.addLangs(['en-US','ar-AE']);
    // translateService.setDefaultLang('en');
    }
    ngOnInit() {
        this.selectedCategory = this.categories[1];
    }

    useLanguage(language: string): void {
        // this.translateService.use(language);
    }


}


                        
     