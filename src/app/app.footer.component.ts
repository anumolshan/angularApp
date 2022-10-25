import {Component} from '@angular/core';
import { CommonService } from './service/common.service';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer clearfix">
            <a href="dashboard.xhtml">
             <img alt="logo-colored" [src]="commonService?.profileDetails?.Logo"/>
            </a>
            <span class="footer-text-right">
                <span>All Rights Reserved</span>
            </span>
        </div>
    `
})
export class AppFooterComponent {
    constructor(public commonService:CommonService){}

}
