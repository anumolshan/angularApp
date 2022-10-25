import { Component, OnDestroy } from '@angular/core';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Auth } from 'aws-amplify';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent implements OnDestroy {

    subscription: Subscription;

    items: MenuItem[];

    constructor(public breadcrumbService: AppBreadcrumbService,public translateService: TranslateService,public router: Router,public confirmationService: ConfirmationService) {
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });       
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    signOut(){
        
        this.confirmationService.confirm({
            // message: this.translateService.instant('common.alert.change_label'),
            // header: this.translateService.instant('common.Content.edit_confirmation_Label'),
            message: 'Do you want to Sign Out?',
            header: 'Update Confirmation',
            icon: 'pi pi-info-circle',
            accept: async () => {
                this.router.navigate(['/']);
                setTimeout(() => {
                    Auth.signOut();
                    localStorage.clear();
                    sessionStorage.clear();
                }, 100);
              
            },
            reject: () => {
      
            }
          });
        
       
    }
}
